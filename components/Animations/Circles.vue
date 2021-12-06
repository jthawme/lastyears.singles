<template>
  <Canvas
    :controlled="false"
    ref="canvas"
    @mounted="onMount"
    @resize="onResize"
  />
</template>

<script>
import { clamp, deg2rad, getVar, mapRange } from "~/assets/js/utils";
import * as THREE from "three";
import { MainEngine } from "~/assets/js/engine";
import Canvas from "../common/Canvas.vue";
import anime from "animejs";

const AMT = 8;

const getCircle = (r, color = 0xff0000) => {
  const geo = new THREE.CylinderGeometry(r, r, 1, 24);
  const mat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });
  // const mat = new THREE.MeshNormalMaterial();

  const mesh = new THREE.Mesh(geo, mat);
  // mesh.add(getPlaneEdges(mesh));

  return mesh;
};

const getCircleGroup = (
  r,
  stroke = 4,
  frontColor = 0x000000,
  bgColor = 0x272727
) => {
  const circle1 = getCircle(r, frontColor);
  const circle2 = getCircle(r - stroke * 2, bgColor);
  circle2.position.z += 0.1;

  const g = new THREE.Group();
  g.add(circle1);
  g.add(circle2);

  return g;
};

export default {
  components: { Canvas },
  mounted() {
    if (!this.unlisten) {
      this.unlisten = [];
    }
  },
  computed: {
    canvas() {
      return this.$refs.canvas.canvas;
    },
    ctx() {
      return this.$refs.canvas.ctx;
    },
    width() {
      return this.$refs.canvas.width;
    },
    height() {
      return this.$refs.canvas.height;
    },
    playing() {
      return this.$store.state.player.playing;
    },
  },
  beforeDestroy() {
    this.unlisten && this.unlisten.forEach((cb) => cb());
    this.engine.destroy();
  },
  watch: {
    playing(newVal) {
      if (!this.animation) {
        return;
      }

      if (newVal) {
        this.animation.play();
      } else {
        this.animation.pause();
      }
    },
  },
  methods: {
    onMount() {
      if (!this.unlisten) {
        this.unlisten = [];
      }

      this.engine = new MainEngine();
      this.engine.setup(this.canvas, this.width, this.height);
      const frontColor = new THREE.Color(getVar("--color-dark-black"));
      const bgColor = new THREE.Color(getVar("--color-bg"));

      const circles = new Array(AMT)
        .fill(0)
        .map(() =>
          getCircleGroup(100, 2, frontColor.getHex(), bgColor.getHex())
        );
      const group = new THREE.Group();

      const positionArray = [];
      circles.forEach((p, i) => {
        p.rotateX(deg2rad(90));
        positionArray.push(p.position);
        group.add(p);
      });

      // group.rotateY(deg2rad(-90));
      this.engine.move(group, 0.5, 0.5);
      this.group = group;

      this.engine.addObject(group);

      this.animation = anime({
        targets: positionArray,
        y: [{ value: -200 }, { value: 200 }, { value: 0 }],
        z: [
          { value: -10, duration: 50 },
          { value: 10, delay: 1000, duration: 50 },
          { value: 10 },
        ],
        x: [
          {
            value: function (el, i) {
              return mapRange(i, 0, AMT - 1, -200, 200);
            },
          },
          { value: 0 },
        ],
        delay: anime.stagger(1000),
        loop: true,
        duration: 3000,
        easing: "easeInOutQuad",
      });

      this.engine.start();
      this.onResize();
    },
    onResize() {
      if (this.engine) {
        this.engine.resize(this.width, this.height);

        const scale = clamp(mapRange(this.width / 950, 0, 1, 0.35, 1), 0.2, 1);
        this.group.scale.set(scale, scale, scale);
        this.engine.move(this.group, 0.5, 0.5);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.outer {
  position: fixed;

  top: 50%;
  left: 50%;

  width: 100%;
  height: 100%;

  transform: translate3d(-50%, -50%, 0);
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
