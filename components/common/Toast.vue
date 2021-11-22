<template>
  <div class="outer" v-if="currentItem">
    <ToastItem :key="currentItem.id" v-bind="currentItem" @remove="onRemove" />
  </div>
</template>

<script>
import ToastItem from "./ToastItem.vue";
export default {
  components: { ToastItem },
  data() {
    return {
      internalItems: [],
    };
  },
  computed: {
    items() {
      return this.$store.state.toast.items;
    },
    currentItem() {
      return this.internalItems[0];
    },
  },
  watch: {
    items(val) {
      if (val.length) {
        const newItem = val[0];
        this.$store.commit("toast/removeToast", newItem.id);
        this.internalItems = [newItem, ...this.internalItems];
      }
    },
  },
  methods: {
    onRemove(id) {
      const idx = this.internalItems.findIndex((item) => item.id === id);
      this.internalItems.splice(idx, 1);
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
