<template>
  <Canvas ref="canvas" @mounted="onMount" />
</template>

<script>
import Canvas from "../common/Canvas.vue";
import { makeNoise2D } from "fast-simplex-noise";
import Loop from "raf-loop";
import { clamp } from "~/assets/js/utils";

const COLS = 50;
const ROWS = 50;

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

      return this.width * 0.9;
    },
    size() {
      return this.groupWidth / COLS;
    },
  },
  beforeDestroy() {
    this.unlisten && this.unlisten.forEach((cb) => cb());
  },
  // watch: {
  //   playing(newVal) {
  //     if (newVal) {
  //       // this.animations.forEach((a) => a.play());
  //     } else {
  //       // this.animations.forEach((a) => a.pause());
  //     }
  //   },
  // },
  methods: {
    onMount() {
      if (!this.unlisten) {
        this.unlisten = [];
      }

      const noise = makeNoise2D();
      let frame = 0;

      this.ctx.fillStyle = `black`;
      const update = () => {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();
        this.ctx.translate(
          (this.width - this.groupWidth) / 2,
          (this.height - this.groupWidth) / 2
        );

        for (let x = 0; x < COLS; x++) {
          for (let y = 0; y < ROWS; y++) {
            this.ctx.save();
            this.ctx.translate(x * this.size, y * this.size);

            this.ctx.beginPath();
            this.ctx.arc(
              clamp(noise((x + frame / 20) / 64, y) * this.size, 0, this.size),
              clamp(
                noise((x + frame / 10) / 10, (x + frame / 10) / 32) * this.size,
                0,
                this.size
              ),
              1,
              0,
              Math.PI * 2
            );
            this.ctx.fill();
            // this.ctx.fillRect(
            //   clamp(noise((x + frame / 20) / 64, y) * this.size, 0, this.size),
            //   clamp(
            //     noise((x + frame / 10) / 10, (x + frame / 10) / 32) * this.size,
            //     0,
            //     this.size
            //   ),
            //   // noise(x, (y + frame / 10) / 64) * this.size,
            //   2,
            //   2
            // );

            this.ctx.restore();
          }
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
