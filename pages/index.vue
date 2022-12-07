<template>
  <div class="main">
    <div class="list" v-for="year in lists" :key="year[0]">
      <!-- <span class="year" v-if="displayYears && notCurrent(year[0])">{{ -->
      <span class="year" v-if="displayYears">{{ year[0] }}</span>
      <nuxt-link
        v-for="list in year[1]"
        class="std"
        :class="{ hide: hideEgoTrip(list.slug) }"
        :to="`/list/${list.slug}`"
        :key="list.slug"
        >{{ list.name }}</nuxt-link
      >
    </div>
  </div>
</template>

<script>
import { listenCb, tickUpdate } from "~/assets/js/utils";
import TextMutate from "~/components/common/TextMutate.vue";
import { SOURCE } from "~/scripts/constants";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "b",
  "a",
  "Enter",
]
  .reverse()
  .join("");

export default {
  // head() {
  //   return {
  //     title: `${this.playing ? "🎵" : null}`,
  //   };
  // },
  data() {
    return {
      displayYears: true,
      keyInputs: [],
    };
  },
  components: { TextMutate },
  mounted() {
    this.unlisten = [];
    this.unlisten.push(
      listenCb(document, "keyup", tickUpdate(this.codeChecker.bind(this)))
    );
  },
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

        // if (!curr.slug.includes(SOURCE.BIG_J_THE_WIZARD_KING) || this.egoTrip) {
        prev[curr.year].push(curr);
        // }

        return prev;
      }, {});

      const entries = Object.entries(years);
      entries.sort((a, b) => b[0] - a[0]);
      return entries.filter((row) => row[1].length);
    },
  },
  methods: {
    hideEgoTrip(slug) {
      return slug.includes(SOURCE.BIG_J_THE_WIZARD_KING) && !this.egoTrip;
    },
    notCurrent(year) {
      return parseInt(year) !== new Date().getFullYear();
    },
    codeChecker(e) {
      this.keyInputs = [e.key, ...this.keyInputs].slice(0, 7);

      if (this.keyInputs.join("") === KONAMI_CODE) {
        const year = new Date().getFullYear();
        let egoToast = null;
        this.$store.commit("toast/addToast", {
          message: `Awesome, you've unlocked my hottest songs of ${year}, enjoy.`,
          action: {
            to: `/list/big-j-the-wizard-king-${year}`,
            label: "Listen now",
            callback: () => {
              this.$store.commit("toast/removeToast", egoToast);
            },
          },
          callback: (id) => {
            egoToast = id;
          },
        });
        this.$store.commit("setEgoTrip", true);
      }
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

.hide {
  display: none;
}

.year {
  display: block;

  margin-bottom: 1em;
}
</style>
