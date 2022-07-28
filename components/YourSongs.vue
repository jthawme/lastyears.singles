<template>
  <div class="outer">
    <h2>Your Songs</h2>

    <div class="pool" v-if="expandedSongs.length">
      <song
        v-for="song in expandedSongs"
        :key="song.id"
        v-bind="song"
        @click.native="() => playSong(song)"
        class="item"
      />
    </div>
    <div class="pool-empty" v-else>
      Like some songs in the bottom bar to add to your own collection
    </div>
  </div>
</template>

<script>
import Song from "./common/Song.vue";

export default {
  components: { Song },
  computed: {
    likedSongs() {
      return this.$store.state.liked.items || [];
    },
    songs() {
      return this.$store.state.liked.songs || [];
    },
    expandedSongs() {
      return this.likedSongs
        .map((item) => this.songs.find((song) => song.id === item))
        .filter((item) => !!item);
    },
  },
  methods: {
    playSong(item) {
      plausible("Song", { props: { song: item.id, source: "your-songs" } });

      this.$store.commit("player/toggleShouldPlay", true);
      this.$store.commit("queue/createQueue", {
        items: this.expandedSongs,
        source: "your-songs",
        position: this.expandedSongs.findIndex((i) => i.id === item.id),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.outer {
  // color: var(--color-bg);
  margin: 8em 0;
  border: 2px solid var(--color-text);

  // background-color: var(--color-text);

  padding: var(--page-padding-x);
  overflow: hidden;

  h2 {
    margin: 0 0 4em;
    font-size: var(--font-size-normal);
  }

  @include tablet {
    padding: calc(var(--page-padding-x) / 2);
  }
}

.pool {
  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;

  @include tablet {
    grid-template-columns: repeat(3, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
  }
}

.item {
  min-width: 0;
}
</style>
