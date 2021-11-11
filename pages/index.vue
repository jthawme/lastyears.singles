<template>
  <div class="main">
    <div class="list">
      <nuxt-link
        v-for="list in lists"
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
  components: { TextMutate },
  computed: {
    lists() {
      return this.$store.state.lists;
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
</style>
