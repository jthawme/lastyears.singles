<template>
  <div class="main">
    <portal to="outside">
      <nuxt-link class="back std" to="/">⟵</nuxt-link>
    </portal>
    <div class="list">
      <div
        class="item"
        v-for="item in items"
        :key="item.id"
        :style="{ '--column': item.column }"
      >
        <Song v-bind="item" @click.native="() => playSong(item)" />
      </div>
    </div>
  </div>
</template>

<script>
import { makeNoise2D } from "fast-simplex-noise";
import { NAMES } from "~/scripts/constants";

export default {
  async asyncData({ params, $http }) {
    const items = await $http.$get(`/${params.slug}.json`);
    const rand = makeNoise2D();

    return {
      source: params.slug,
      items: items.map((item, idx) => ({
        ...item,
        column: (rand(0, idx * 10) + 1) / 2,
      })),
    };
  },
  head() {
    const parts = this.source.split("-");
    const year = parseInt(parts.splice(parts.length - 1, 1));
    const baseName = parts.join("-");

    return {
      title: `${NAMES[baseName]}${
        year !== new Date().getFullYear() ? ` (${year})` : ""
      }`,
    };
  },
  mounted() {
    // this.checkHash();
  },
  methods: {
    playSong(item) {
      plausible("Song", { props: { song: item.id, source: this.source } });
      this.$store.commit("player/toggleShouldPlay", true);
      this.$store.commit("queue/createQueue", {
        items: this.items,
        source: this.source,
        position: this.items.findIndex((i) => i.id === item.id),
        needsUpdating: true,
      });
      this.$store.commit("player/setSongDetails", {
        id: item.id,
        title: item.title,
        artists: item.artists,
        spotify_id: item.spotify_id,
      });
    },
    checkHash() {
      if (window.location.hash) {
        const id = parseInt(window.location.hash.substring(1), 10);

        if (document.getElementById(id)) {
          const { offsetTop } = document.getElementById(id);

          console.log(offsetTop);

          window.scrollTo(0, offsetTop);
        }
      }
    },
  },
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
  padding-top: calc(var(--page-padding-y) * 2);
}

.list {
  display: flex;

  flex-direction: column;

  .item {
    margin-left: calc(var(--column, 0) * 50%);

    padding-bottom: 50px;
  }

  @include tablet {
    .item {
      margin-left: calc(var(--column, 0) * 85%);

      padding-bottom: 50px;
    }
  }
}

.back {
  position: fixed;

  top: var(--page-padding-y);
  left: var(--page-padding-x);
  color: inherit;

  text-decoration: none;

  margin-bottom: 3em;

  z-index: 10;

  user-select: none;

  &:after {
    content: "Back";

    margin-left: 0.8ch;
    opacity: 0;

    // transition: {
    //   duration: 0.25s;
    //   property: opacity;
    // }
  }

  &:hover,
  &:focus-visible {
    &:after {
      opacity: 1;
    }
  }
}
</style>
