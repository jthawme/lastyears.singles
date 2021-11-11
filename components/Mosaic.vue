<template>
  <div class="outer" :style="{ '--actual-height': actualHeight }">
    <canvas ref="canvas" />
  </div>
</template>

<script>
import { makeNoise2D } from "fast-simplex-noise";
import { onWindowResize, tickUpdate } from "../assets/js/utils";

export default {
  data() {
    return {
      actualHeight: undefined,
    };
  },
  mounted() {
    this.random = Math.random();
    this.randomX = Math.round(Math.random() * 200);
    this.randomY = Math.round(Math.random() * 200);
    this.run();

    this.unlisten = [];
    this.unlisten.push(onWindowResize(tickUpdate(this.run.bind(this))));
  },
  beforeDestroy() {
    this.unlisten && this.unlisten.forEach((cb) => cb());
  },
  methods: {
    run() {
      if (this.updater) {
        clearTimeout(this.updater);
      }

      const rand = makeNoise2D(() => this.random);

      const width = this.$el.clientWidth;
      const height = this.$el.clientHeight;
      const color = getComputedStyle(this.$el)
        .getPropertyValue("--color-text")
        .trim();
      // const color = "black";

      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      const colSize = 5;

      const cols = Math.floor(width / colSize);
      const rows = Math.floor(cols * 0.56);

      const remainder = (width - cols * colSize) / cols;

      const actualColSize = colSize + remainder;
      this.actualHeight = rows * actualColSize;

      const grid = [];
      for (let x = 0; x < cols; x++) {
        grid.push([]);

        for (let y = 0; y < rows; y++) {
          grid[x].push({
            on:
              rand(x / this.randomX, y / this.randomY) >
              Math.random() / 2 + 0.5,
            // active: Math.random() > 0.9,
            active: false,
          });
        }
      }

      const update = () => {
        const inactive = [];

        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            if (grid[x][y].on && !grid[x][y].active) {
              inactive.push([x, y]);
            }
          }
        }

        // inactive.forEach((entry) => (grid[entry[0]][entry[1]].active = true));
        const [x, y] = inactive[Math.floor(Math.random() * inactive.length)];
        grid[x][y].active = true;

        draw();

        if (inactive.length) {
          this.updater = setTimeout(() => {
            update();
            // }, 250);
          }, 50);
        }
      };

      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = color;

        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            if (grid[x][y].on && grid[x][y].active) {
              ctx.save();
              ctx.translate(x * actualColSize, y * actualColSize);
              ctx.fillRect(
                0,
                0,
                Math.ceil(actualColSize),
                Math.ceil(actualColSize)
              );
              // ctx.beginPath();
              // ctx.arc(
              //   actualColSize / 2,
              //   actualColSize / 2,
              //   actualColSize / 4,
              //   0,
              //   Math.PI * 2
              // );
              // ctx.fill();
              ctx.restore();
            }
          }
        }
      };

      update();
    },
  },
};
</script>

<style lang="scss" scoped>
.outer {
  width: 100%;
  height: var(--actual-height, 300px);

  margin-top: 4em;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
