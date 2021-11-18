<template>
  <div class="main">
    <nuxt-link class="back std" to="/">⟵ Back</nuxt-link>
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
  methods: {
    playSong(item) {
      this.$store.commit("player/toggleShouldPlay", true);
      this.$store.commit("queue/createQueue", {
        items: this.items,
        source: this.source,
        position: this.items.findIndex((i) => i.id === item.id),
      });
      this.$store.commit("player/setSongDetails", {
        id: item.id,
        title: item.title,
        artists: item.artists,
        spotify_id: item.spotify_id,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.main {
  padding: var(--page-padding);
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
  color: inherit;

  text-decoration: none;

  margin-bottom: 3em;
}
</style>
