<template>
  <div class="outer">
    <canvas ref="canvas" />
  </div>
</template>

<script>
import { onWindowResize, tickUpdate } from "~/assets/js/utils";
export default {
  data() {
    return {
      width: -1,
      height: -1,
    };
  },
  mounted() {
    this.unlisten = [];
    this.unlisten.push(onWindowResize(tickUpdate(this.onResize.bind(this))));

    this.onResize();
    this.$emit("mounted");
  },
  beforeDestroy() {
    this.unlisten && this.unlisten.forEach((cb) => cb());
  },
  computed: {
    canvas() {
      return this.$refs.canvas;
    },
  },
  methods: {
    onResize() {
      this.width = this.$el.clientWidth;
      this.height = this.$el.clientHeight;

      // const dpr = window.devicePixelRatio;

      // canvas.width = this.width * dpr;
      // canvas.height = this.height * dpr;
      // canvas.style.width = `${this.width}px`;
      // canvas.style.height = `${this.height}px`;

      this.$emit("resize", {
        width: this.width,
        height: this.height,
      });
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
