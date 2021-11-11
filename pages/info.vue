<template>
  <div class="main">
    <span class="largeness">Music is dead. Long live Music.</span>

    <your-songs />

    <mosaic />

    <about />
  </div>
</template>

<script>
import About from "../components/About.vue";
import Mosaic from "../components/Mosaic.vue";
import YourSongs from "../components/YourSongs.vue";
export default {
  components: { YourSongs, About, Mosaic },
};
</script>

<style lang="scss" scoped>
.main {
  padding: var(--page-padding);
}

.largeness {
  display: block;

  font-size: 17vw;
  line-height: 0.9;

  margin: 0 -1vw;
}
</style>
