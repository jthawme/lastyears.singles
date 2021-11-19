<template>
  <div class="main">
    <div class="list" v-for="year in lists" :key="year[0]">
      <span class="year" v-if="notCurrent(year[0])">{{ year[0] }}</span>
      <nuxt-link
        v-for="list in year[1]"
        class="std"
        :to="`/list/${list.slug}`"
        :key="list.slug"
        >{{ list.name }}</nuxt-link
      >
    </div>
  </div>
</template>

<script>
import TextMutate from "~/components/common/TextMutate.vue";
export default {
  head() {
    return {
      title: `${this.playing ? "🎵" : ""} Choose`,
    };
  },
  components: { TextMutate },
  computed: {
    playing() {
      return this.$store.state.player.playing;
    },
    lists() {
      const lists = this.$store.state.lists;
      const years = lists.reduce((prev, curr) => {
        if (!prev[curr.year]) {
          prev[curr.year] = [];
        }

        prev[curr.year].push(curr);

        return prev;
      }, {});

      return Object.entries(years);
    },
  },
  methods: {
    notCurrent(year) {
      return year !== new Date().getFullYear();
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
  align-items: flex-start;
}

.year {
  display: block;

  margin-bottom: 1em;
}
</style>
