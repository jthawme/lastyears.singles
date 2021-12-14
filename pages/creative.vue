<template>
  <div class="main" @click="advance">
    <div class="out">
      <Squares class="canvas" v-if="index % max === 0" />
      <Circles class="canvas" v-if="index % max === 1" />
      <Field class="canvas" v-if="index % max === 2" />
      <ShiftSquares class="canvas" v-if="index % max === 3" />
      <Ticking class="canvas" v-if="index % max === 4" />
      <CircleWaves class="canvas" v-if="index % max === 5" />
      <Lissajous class="canvas" v-if="index % max === 6" />
      <Swell class="canvas" v-if="index % max === 7" />
    </div>

    <button @click="colour">colour</button>
  </div>
</template>

<script>
export default {
  layout: "none",
  head() {
    return {
      title: `Creative`,
    };
  },
  components: {
    Squares: () => import("../components/Animations/Squares.vue"),
    Circles: () => import("../components/Animations/Circles.vue"),
    Field: () => import("../components/Animations/Field.vue"),
    CircleWaves: () => import("../components/Animations/CircleWaves.vue"),
    ShiftSquares: () => import("../components/Animations/ShiftSquares.vue"),
    Ticking: () => import("../components/Animations/Ticking.vue"),
    Lissajous: () => import("../components/Animations/Lissajous.vue"),
    World: () => import("../components/Animations/World.vue"),
    Swell: () => import("../components/Animations/Swell.vue"),
  },
  data() {
    return {
      index: 0,
      max: 8,
    };
  },
  mounted() {
    this.$store.commit("player/forcePlayState", true);
  },
  methods: {
    advance(e) {
      if (e.target.tagName !== "BUTTON") {
        this.index++;
      }
    },
    colour() {
      this.$store.commit(
        "cycleColour",
        (this.$store.state.colour + 1) % this.$store.state.maxColours
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.canvas {
  position: relative !important;

  width: 500px !important;
  height: 500px !important;

  top: 0;
  left: 0;

  transform: none !important;
}

.main {
  display: flex;

  align-items: center;
  justify-content: center;

  height: 100vh;
}

.out {
  padding: 20px;

  outline: 1px solid red;
}
</style>
