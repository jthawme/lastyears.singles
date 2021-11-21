<template>
  <div class="main">
    <span class="largeness">Music is dead. Long live Music.</span>

    <client-only>
      <your-songs />
    </client-only>

    <mosaic />

    <about />
  </div>
</template>

<script>
import About from "../components/About.vue";
import Mosaic from "../components/Mosaic.vue";
import YourSongs from "../components/YourSongs.vue";
export default {
  head() {
    return {
      title: `Info`,
    };
  },
  components: { YourSongs, About, Mosaic },
  computed: {
    playing() {
      return this.$store.state.player.playing;
    },
  },
};
</script>

<style lang="scss" scoped>
.main {
  padding: var(--page-padding);
}

.largeness {
  display: block;

  font-size: 24vw;
  line-height: 0.9;

  margin: 0 -1vw;

  @include tablet {
    font-size: 17vw;
  }
}
</style>
