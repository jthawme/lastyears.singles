<template>
  <Canvas ref="canvas" @mounted="onMount" />
</template>

<script>
import { makeNoise2D } from "fast-simplex-noise";
import Canvas from "../common/Canvas.vue";
import Loop from "raf-loop";
import { clamp, getVar, lerp, mapRange } from "~/assets/js/utils";

const COLS = 5;
const ROWS = 3;

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
        return this.height * 0.65;
      }

      return this.width * 0.8;
    },
  },
  beforeDestroy() {
    this.unlisten && this.unlisten.forEach((cb) => cb());
  },
  methods: {
    onMount() {
      if (!this.unlisten) {
        this.unlisten = [];
      }

      let frame = 0;

      const points = new Array(3).fill(0).map(() => 0.5);

      const rand = makeNoise2D();
      this.ctx.fillStyle = getVar("--color-dark-black");

      // this.ctx.strokeStyle = `black`;
      const update = () => {
        // this.ctx.clearRect(0, 0, this.width, this.height);
        // this.ctx.fillStyle = `rgba(39, 39, 39, 0.05)`;
        // this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.globalAlpha = 0.025; // fade rate
        this.ctx.globalCompositeOperation = "destination-out"; // fade out destination pixels
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.globalAlpha = 1;

        this.ctx.save();
        this.ctx.translate(
          (this.width - this.groupWidth) / 2,
          (this.height - this.groupWidth) / 2
          // (this.height - this.groupWidth) / 2 + this.size * p
        );

        const w = (p, wid = this.groupWidth) => wid * p;
        const h = (p, hei = this.groupWidth) => hei * p;

        const drawCurve = (cx, cy, r, xSpeed, ySpeed) => {
          // this.ctx.beginPath();
          // this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
          // this.ctx.stroke();

          const dx = r * Math.sin(frame * (xSpeed + 1));
          const dy = r * Math.cos(frame * (ySpeed + 1));

          this.ctx.beginPath();
          this.ctx.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2);
          this.ctx.fill();

          // this.ctx.beginPath();
          // this.ctx.moveTo(-r, cy + dy);
          // this.ctx.lineTo(w(1) + r, cy + dy);
          // this.ctx.stroke();

          // this.ctx.beginPath();
          // this.ctx.moveTo(cx + dx, -r);
          // this.ctx.lineTo(cx + dx, h(1) + r);
          // this.ctx.stroke();
        };

        for (let x = 0; x < COLS; x++) {
          for (let y = 0; y < ROWS; y++) {
            const ix = (_x = x) => _x * (1 / (COLS - 1));
            const iy = (_y = y) => (_y + 1) * (1 / (ROWS + 1));

            drawCurve(w(ix()), h(iy()), w(ix(1)) * 0.4, x, y);
          }
        }

        this.ctx.restore();

        if (this.playing) {
          frame += 0.01;
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
