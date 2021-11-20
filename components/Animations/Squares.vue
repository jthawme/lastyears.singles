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

const AMT = 6;

const getPlane = (w, h, color = 0xff0000) => {
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    depthTest: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  // mesh.add(getPlaneEdges(mesh));

  return mesh;
};

const getPlaneGroup = (w, h, stroke = 4) => {
  const plane1 = getPlane(w * 1.05, h, 0x000000);
  const plane2 = getPlane(w * 1.05 - stroke * 2, h - stroke * 2, 0x272727);
  plane2.position.z += 0.1;

  const g = new THREE.Group();
  g.add(plane1);
  g.add(plane2);

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

      const planes = new Array(AMT).fill(0).map(() => getPlaneGroup(300, 300));
      const group = new THREE.Group();

      const range = (AMT - 1) * 35;
      const staggerArray = [];
      const positionArray = [];
      const scaleArray = [];
      planes.forEach((p, i) => {
        const r = mapRange(i, AMT, 0, -range, range);
        p.position.z = r;
        p.position.y = r * 0.15;

        staggerArray.push(p.rotation);
        positionArray.push(p.position);
        scaleArray.push(p.scale);

        if (p !== 0) {
          p.renderOrder = i;
          group.add(p);
        }
      });
      planes[0].renderOrder = 100;
      group.add(planes[0]);

      // group.rotateY(deg2rad(-35));
      // group.rotateX(deg2rad(180));
      // group.rotateZ(deg2rad(1));
      group.rotation.set(deg2rad(-20), deg2rad(-30), deg2rad(-1));
      this.group = group;

      // const box3 = new THREE.Box3().setFromObject(group);
      // const vector = new THREE.Vector3();
      // box3.getCenter(vector);
      // group.position.set(-vector.x, -vector.y, -vector.z);

      // this.engine.camera.position.set(10, -20, 15);
      // this.engine.camera.rotation.order = "YXZ";
      // this.engine.camera.rotation.y = -Math.PI / 5;
      // this.engine.camera.rotation.x = Math.atan(-1 / Math.sqrt(4));
      // this.engine.camera.lookAt(group.position);
      // group.position.set(this.engine.scene.position);

      window.group = group;

      this.engine.addObject(group);

      this.animations = [
        anime({
          targets: staggerArray,
          z: deg2rad(90),
          delay: anime.stagger(250, { start: 1000 }),
          loop: true,
          duration: 2000,
          easing: "easeInOutQuart",
        }),
        anime({
          targets: scaleArray,
          x: 0.95,
          y: 1.05,
          delay: anime.stagger(250, { start: 1000 }),
          loop: true,
          duration: 2000,
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
