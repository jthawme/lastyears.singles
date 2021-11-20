<template>
  <div class="outer">
    <canvas ref="canvas" />
  </div>
</template>

<script>
import { onWindowResize, tickUpdate } from "~/assets/js/utils";
export default {
  props: {
    controlled: {
      type: Boolean,
      default: true,
    },
  },
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
    ctx() {
      return this.controlled && this.canvas
        ? this.canvas.getContext("2d")
        : null;
    },
  },
  methods: {
    onResize() {
      this.width = this.$el.clientWidth;
      this.height = this.$el.clientHeight;

      if (this.controlled) {
        const dpr = window.devicePixelRatio;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
      }

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
