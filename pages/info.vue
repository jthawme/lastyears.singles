<template>
  <div class="main">
    <span class="largeness">Music is&nbsp;dead. Long live Music.</span>

    <client-only>
      <YourSongs />
    </client-only>

    <Mosaic />

    <About />

    <Share />
  </div>
</template>

<script>
import Share from "~/components/Share.vue";
import About from "../components/About.vue";
import Mosaic from "../components/Mosaic.vue";
import YourSongs from "../components/YourSongs.vue";

export default {
  head() {
    return {
      title: `Info`,
    };
  },
  components: { YourSongs, About, Mosaic, Share },
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
  display: flex;

  font-size: 22vw;
  line-height: 0.9;

  margin: 0 -1vw;

  height: calc(100vh - 140px);
  align-items: center;
  justify-content: center;

  @include tablet {
    height: auto;
    font-size: 17vw;
  }
}
</style>
