<template>
  <Canvas ref="canvas" @mounted="onMount" />
</template>

<script>
import { makeNoise2D } from "fast-simplex-noise";
import Canvas from "../common/Canvas.vue";
import Loop from "raf-loop";
import { clamp, lerp, mapRange } from "~/assets/js/utils";

const LINES = 5;

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

      this.ctx.strokeStyle = `black`;
      const update = () => {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();
        this.ctx.translate(
          (this.width - this.groupWidth) / 2,
          (this.height - this.groupWidth) / 2
          // (this.height - this.groupWidth) / 2 + this.size * p
        );

        const w = (p, wid = this.groupWidth) => wid * p;
        const h = (p, hei = this.groupWidth) => hei * p;

        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(w(0.5), h(0.5), w(0.5), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.clip();

        const lineSize = 1 / (LINES + 1);

        for (let y = 0; y < LINES; y++) {
          const yi = (y + 1) * lineSize;

          this.ctx.beginPath();
          for (let x = 0; x < points.length; x++) {
            const i = (_x = x) => _x * (1 / (points.length - 1));
            const r = (_x = x) =>
              mapRange(rand(_x + frame / 1000, yi), -1, 1, -lineSize, lineSize);

            if (x === 0) {
              this.ctx.moveTo(w(i()), h(yi + r()));
            } else {
              this.ctx.bezierCurveTo(
                w(i(x - 1) + i(0.5)),
                h(yi + r(x - 1)),
                w(i() - i(0.5)),
                h(yi + r()),
                w(i()),
                h(yi + r())
              );
              // this.ctx.lineTo(w(i), h(rand((x + frame) / 200, 0)));
            }
          }
          this.ctx.stroke();
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
