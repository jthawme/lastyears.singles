<template>
  <audio ref="preview" :src="src" autoplay />
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  computed: {
    shouldPlay() {
      return this.$store.state.player.shouldPlay;
    },
  },
  watch: {
    shouldPlay(val) {
      if (!val) {
        this.$refs.preview.pause();
      } else {
        this.$refs.preview.play();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
