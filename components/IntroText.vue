<template>
  <div>
    <span class="big">{{ text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    loop: {
      type: Boolean,
      default: false,
    },
    parts: {
      type: Array,
      default: () => [
        "",
        "Listen to the greatest music",
        "from the last year",
        "from the greatest sources",
        "on the internet",
      ],
    },
  },
  data() {
    return {
      index: 0,
    };
  },
  mounted() {
    this.update();
  },
  methods: {
    update() {
      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        if (this.index > this.parts.length && !this.loop) {
          this.$emit("done");
        } else {
          this.index++;
          this.update();
        }
      }, 500);
    },
  },
  computed: {
    text() {
      return this.parts[
        this.loop ? this.index % this.parts.length : this.index
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.big {
  position: fixed;

  top: 50%;
  left: 50%;

  width: 100%;

  font-size: 10vw;

  padding: 0 var(--page-padding-x);

  transform: translate3d(-50%, -50%, 0);
  pointer-events: none;

  text-align: center;
  color: var(--color-active);

  text-transform: uppercase;

  z-index: 100;

  @include tablet {
    font-size: 4vw;
  }
}
</style>
