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
// import { makeNoise2D } from "fast-simplex-noise";
// import { onWindowResize, tickUpdate } from "../assets/js/utils";

const AMT = 6;

const getCube = (s, color = 0xff0000) => {
  const geo = new THREE.BoxGeometry(s, s, s);
  const mat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    wireframe: true,
  });

  const mesh = new THREE.Mesh(geo, mat);
  // mesh.add(getPlaneEdges(mesh));

  return mesh;
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
      return this.$store.state.player.shouldPlay;
    },
    colour() {
      return this.$store.state.colour;
    },
  },
  beforeDestroy() {
    this.unlisten && this.unlisten.forEach((cb) => cb());
    this.engine.destroy();
  },
  watch: {
    colour() {
      const frontColor = new THREE.Color(getVar("--color-dark-black"));
      this.group.traverse((child) => {
        if (child.material) {
          child.material = new THREE.MeshBasicMaterial({
            color: frontColor,
            side: THREE.DoubleSide,
            wireframe: true,
          });
        }
      });
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

      const cubes = new Array(AMT).fill(0).map(() => getCube(50, frontColor));
      const group = new THREE.Group();

      const r = 500;

      cubes.forEach((cube, idx, arr) => {
        const dx = r * Math.sin(Math.PI * 2 * (idx / arr.length));
        const dz = r * Math.cos(Math.PI * 2 * (idx / arr.length));

        cube.position.set(dx, 0, dz);
        group.add(cube);
      });

      this.group = group;

      this.engine.move(this.group, 0.5, 0.5);
      this.engine.render(() => {
        if (this.playing) {
          cubes.forEach((cube) => {
            cube.rotation.x += deg2rad(1);
            cube.rotation.y += deg2rad(1);
          });

          this.group.rotateY(deg2rad(0.25));
          this.group.rotateZ(deg2rad(0.25));
        }
      });
      this.engine.addObject(group);

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
