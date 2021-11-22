<template>
  <Canvas
    :controlled="false"
    ref="canvas"
    @mounted="onMount"
    @resize="onResize"
  />
</template>

<script>
import { clamp, deg2rad, mapRange } from "~/assets/js/utils";
import * as THREE from "three";
import { MainEngine } from "~/assets/js/engine";
import Canvas from "../common/Canvas.vue";
import anime from "animejs";
// import { makeNoise2D } from "fast-simplex-noise";
// import { onWindowResize, tickUpdate } from "../assets/js/utils";

const AMT = 5;

const getPin = (width, height) => {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x000000,
  });
  const geo = new THREE.BoxGeometry(width, height, 1);

  return new THREE.Mesh(geo, mat);
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
      if (!this.animations) {
        return;
      }

      if (newVal) {
        this.animations.forEach((a) => a.play());
      } else {
        this.animations.forEach((a) => a.pause());
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

      const planes = new Array(AMT).fill(0).map(() => getPin(10, 200));
      const group = new THREE.Group();

      const range = (AMT - 1) * 50;
      const staggerArray = [];

      planes.forEach((p, i) => {
        const r = mapRange(i, 0, AMT, -range, range);
        p.position.x = r + 50 / 2;

        staggerArray.push(p.rotation);
        group.add(p);
      });
      this.group = group;
      this.engine.addObject(group);

      this.animations = [
        anime({
          targets: staggerArray,
          z: [{ value: deg2rad(90) }, { value: deg2rad(180) }],
          delay: anime.stagger(500),
          loop: true,
          duration: 4000,
          easing: "easeInOutQuart",
        }),
      ];

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
