<template>
  <span class="icon">
    <component :is="iconComponent" />
  </span>
</template>

<script>
import albums from "~/assets/img/icons/albums.svg?inline";
import layers from "~/assets/img/icons/layers.svg?inline";
import play from "~/assets/img/icons/play.svg?inline";
import pause from "~/assets/img/icons/pause.svg?inline";
import add from "~/assets/img/icons/add.svg?inline";
import skipbackward from "~/assets/img/icons/skipbackward.svg?inline";
import skipforward from "~/assets/img/icons/skipforward.svg?inline";
import open from "~/assets/img/icons/open.svg?inline";
import x from "~/assets/img/icons/x.svg?inline";
import arrowback from "~/assets/img/icons/arrowback.svg?inline";
import refresh from "~/assets/img/icons/refresh.svg?inline";
import sync from "~/assets/img/icons/sync.svg?inline";
import egg from "~/assets/img/icons/egg.svg?inline";

const icons = {
  pause,
  play,
  albums,
  layers,
  add,
  skipbackward,
  skipforward,
  open,
  x,
  arrowback,
  refresh,
  sync,
  egg,
};

export const iconKeys = Object.keys(icons);

export default {
  props: {
    name: {
      // type: String as PropType<keyof typeof icons>,
      type: String,
      required: true,
    },
  },
  computed: {
    iconComponent() {
      return icons[this.name];
    },
  },
};
</script>

<style lang="scss" scoped>
.icon {
  display: inline-block;

  width: var(--icon-size, 1em);
  height: var(--icon-size, 1em);

  color: var(--icon-color, inherit);

  line-height: 0;

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
