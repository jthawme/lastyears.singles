<template>
  <component :is="tagName" class="word">
    <span
      v-for="(char, idx) in characters"
      :key="idx"
      :class="{ invert: char.invert }"
      >{{ char.text }}</span
    >
  </component>
</template>

<script>
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charactersLength = characters.length;
const getRandom = (text) => {
  return text.map(() => ({
    text: characters.charAt(Math.floor(Math.random() * charactersLength)),
    invert: Math.random() > 0.8,
  }));
};

export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    speed: {
      type: Number,
      default: 1000,
    },
    tagName: {
      type: String,
      default: "div",
    },
    autoPlay: {
      type: Boolean,
      default: true,
    },
    show: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    const destination = this.text.split("").map((c) => ({ text: c }));

    return {
      destination,
      characters: getRandom(destination),
    };
  },
  beforeMount() {
    this.playing = false;
  },
  watch: {
    show(val, oldVal) {
      if (val && !oldVal && !this.playing) {
        this.update();
      }
    },
  },
  mounted() {
    this.start = Date.now();
    this.last = this.start;

    if (this.autoPlay) {
      this.update();
    }
  },
  beforeDestroy() {
    cancelAnimationFrame(this.raf);
  },
  methods: {
    update(dt = 0) {
      this.playing = true;
      const now = Date.now();

      if (now > this.start + this.speed) {
        this.characters = this.destination;
        return;
      }

      if (now > this.last + 50) {
        this.last = now;
        this.characters = getRandom(this.destination);
      }
      this.raf = requestAnimationFrame(this.update);
    },
  },
};
</script>

<style lang="scss" scoped>
.word {
  font-family: inherit;

  span {
    &.invert {
      color: var(--color-bg);
      background-color: var(--color-text);
    }
  }
}
</style>
