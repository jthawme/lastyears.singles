<template>
  <Canvas ref="canvas" @mounted="onMount" />
</template>

<script>
import { makeNoise2D } from "fast-simplex-noise";
import Canvas from "../common/Canvas.vue";
import Loop from "raf-loop";
import { clamp, getVar, lerp, mapRange } from "~/assets/js/utils";
import anime from "animejs";
import { map } from "cheerio/lib/api/traversing";

const AMT = 40;

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
    groupWidth() {
      if (this.width > this.height) {
        return this.width * 1;
      }

      return this.height * 1;
    },
    colour() {
      return this.$store.state.colour;
    },
  },
  beforeDestroy() {
    this.unlisten && this.unlisten.forEach((cb) => cb());
  },
  watch: {
    colour() {
      this.ctx.fillStyle = getVar("--color-black");
      this.ctx.strokeStyle = getVar("--color-dark-black");
    },
  },
  methods: {
    onMount() {
      if (!this.unlisten) {
        this.unlisten = [];
      }

      let frame = 0;

      this.ctx.fillStyle = getVar("--color-black");
      this.ctx.strokeStyle = getVar("--color-dark-black");
      this.ctx.lineWidth = 4;

      // this.ctx.strokeStyle = `black`;
      const update = () => {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();
        // this.ctx.translate(
        //   (this.width - this.groupWidth) / 2,
        //   (this.height - this.groupWidth) / 2
        //   // (this.height - this.groupWidth) / 2 + this.size * p
        // );
        this.ctx.translate(
          this.width / 2,
          this.height / 2
          // (this.height - this.groupWidth) / 2 + this.size * p
        );

        this.ctx.rotate(frame / 100);

        const w = (p, wid = this.groupWidth) => wid * p;
        const h = (p, hei = this.groupWidth) => hei * p;

        for (let i = 0; i < AMT; i++) {
          this.ctx.save();
          const r = mapRange((i + frame / 100) % AMT, 0, AMT, 0, Math.PI * 2);
          this.ctx.rotate(r);
          this.ctx.translate(
            0,
            h(mapRange((i + frame / 100) % AMT, 0, AMT, 0.001, 1))
          );

          this.ctx.beginPath();
          this.ctx.arc(
            0,
            0,
            w(mapRange((i + frame / 100) % AMT, 0, AMT, 0, 0.35)),
            0,
            Math.PI * 2
          );
          this.ctx.stroke();
          // this.ctx.fill();
          this.ctx.restore();
        }

        this.ctx.restore();

        if (this.playing) {
          frame++;
        }
      };

      const engine = Loop(update);
      engine.start();

      this.unlisten.push(() => {
        engine.stop();
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
