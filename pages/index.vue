<template>
  <div class="main">
    <div class="list" v-for="year in lists" :key="year[0]">
      <span class="year" v-if="displayYears && notCurrent(year[0])">{{
        year[0]
      }}</span>
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
import { SOURCE } from "~/scripts/constants";
export default {
  head() {
    return {
      title: `${this.playing ? "🎵" : ""} Choose`,
    };
  },
  data() {
    return {
      displayYears: true,
    };
  },
  components: { TextMutate },
  computed: {
    playing() {
      return this.$store.state.player.playing;
    },
    egoTrip() {
      return this.$store.state.egoTrip;
    },
    lists() {
      const lists = this.$store.state.lists;
      const years = lists.reduce((prev, curr) => {
        if (!prev[curr.year]) {
          prev[curr.year] = [];
        }

        if (!curr.slug.includes(SOURCE.BIG_J_THE_WIZARD_KING) || this.egoTrip) {
          prev[curr.year].push(curr);
        }

        return prev;
      }, {});

      const entries = Object.entries(years);
      entries.sort((a, b) => b[0] - a[0]);
      return entries;
    },
  },
  methods: {
    notCurrent(year) {
      return parseInt(year) !== new Date().getFullYear();
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

  margin-bottom: 2em;
}

.year {
  display: block;

  margin-bottom: 1em;
}
</style>
