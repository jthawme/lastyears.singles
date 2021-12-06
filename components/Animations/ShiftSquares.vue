<template>
  <Canvas ref="canvas" @mounted="onMount" />
</template>

<script>
import Canvas from "../common/Canvas.vue";
import Loop from "raf-loop";
import { clamp, getVar, lerp, mapRange } from "~/assets/js/utils";

const COLS = 10;
const ROWS = 10;

let TweenValue = (initialValue, targetValue) => {
  let _value = initialValue;
  let _target = Array.isArray(targetValue)
    ? targetValue.slice()
    : [targetValue];
  let parts = [_value, ..._target];

  return {
    // set(val) {
    //   _value = val;
    // },
    // to(val) {
    //   _target = Array.isArray(targetValue)
    //     ? targetValue.slice()
    //     : [targetValue];
    // },
    get(perc) {
      const _p = clamp(perc, 0, 1);
      const partSize = 1 / (parts.length - 1);
      const section = Math.floor((parts.length - 1) * _p);

      const remainder = _p - section * partSize;

      if (_p === 1) {
        return parts[parts.length - 1];
      }

      return lerp(
        parts[section],
        parts[section + 1],
        clamp(remainder / partSize, 0, 1)
      );
    },
  };
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
    groupWidth() {
      if (this.width > this.height) {
        return this.height * 0.65;
      }

      return this.width * 0.8;
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

      let frame = 0;

      const vy = TweenValue(1, [0, 0]);
      const vx = TweenValue(1, [1, 0]);
      const diff = 2;
      const frames = 200;

      this.ctx.strokeStyle = getVar("--color-dark-black");
      const update = () => {
        this.ctx.clearRect(0, 0, this.width, this.height);
        const p = clamp((frame % 100) / 100, 0, 1);

        this.ctx.save();
        this.ctx.translate(
          (this.width - this.groupWidth) / 2,
          (this.height - this.groupWidth) / 2
          // (this.height - this.groupWidth) / 2 + this.size * p
        );

        let i = 0;
        const total = ((COLS + 2) * (ROWS + 2)) / 2;

        this.ctx.beginPath();
        this.ctx.rect(-1, -1, this.groupWidth + 2, this.groupWidth + 2);
        this.ctx.clip();

        for (let x = -1; x < COLS + 1; x++) {
          for (let y = -1; y < ROWS + 1; y++) {
            if (((y % 2) + (x % 2)) % 2 === 0) {
              // const p = clamp((frame % f(1)) / f(1), 0, 1);
              const p = mapRange(frame % frames, 0, frames, 0, 1 + diff);
              const m = mapRange(i, 0, total, 0, -diff);

              this.ctx.save();
              this.ctx.translate(
                x * this.size + this.size * vx.get(p + m),
                y * this.size + this.size * vy.get(p + m)
              );
              this.ctx.strokeRect(-1, -1, 2, 2);
              this.ctx.restore();
              i++;
            }
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
