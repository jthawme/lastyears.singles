<template>
  <div class="outer" v-if="currentItem">
    <ToastItem :key="currentItem.id" v-bind="currentItem" @remove="onRemove" />
  </div>
</template>

<script>
import ToastItem from "./ToastItem.vue";
export default {
  components: { ToastItem },
  computed: {
    items() {
      return this.$store.state.toast.items;
    },
    currentItem() {
      return this.items[0];
    },
  },
  methods: {
    onRemove(id) {
      this.$store.commit("toast/removeToast", id);
    },
  },
};
</script>

<style lang="scss" scoped>
.outer {
  position: fixed;

  bottom: 0;
  left: 0;

  z-index: 4;

  width: 100%;

  padding: var(--page-padding-y) var(--page-padding-x)
    calc(var(--page-padding-x) + 100px);

  background-color: var(--color-active);

  @include tablet {
    padding: var(--page-padding-y) var(--page-padding-x)
      calc(var(--page-padding-x) + 32px);
  }
}
</style>
