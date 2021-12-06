<template>
  <nav>
    <connect-spotify v-if="spotifyUrl" :url="spotifyUrl" />

    <nuxt-link
      class="link"
      :class="{ active: route === '/info' }"
      :to="currentLink"
    >
      Info
    </nuxt-link>
  </nav>
</template>

<script>
import ConnectSpotify from "./ConnectSpotify.vue";
export default {
  components: { ConnectSpotify },
  computed: {
    route() {
      return this.$route.path;
    },
    currentLink() {
      if (this.route !== "/info") {
        return "/info";
      }

      const lastPath = this.paths.pop();

      return lastPath || "/";
    },
    spotifyUrl() {
      return this.$store.state.spotify.spotifyAuthoriseUrl;
    },
  },
  watch: {
    route: {
      immediate: true,
      handler(newVal) {
        if (newVal !== "/info") {
          this.paths.push(newVal);
        }
      },
    },
  },
  data() {
    return {
      paths: [],
    };
  },
};
</script>

<style lang="scss" scoped>
nav {
  position: relative;

  top: 0;
  right: 0;

  width: 100%;

  z-index: 10;

  display: unset;

  @include tablet {
    position: fixed;

    top: var(--page-padding-y);
    right: var(--page-padding-x);

    display: flex;
    align-items: center;

    width: auto;
  }
}

.link {
  position: sticky;

  top: var(--page-padding-x);
  right: var(--page-padding-y);

  display: block;

  width: 28px;
  height: 28px;

  float: right;

  color: var(--color-text);
  border: 0.1rem solid currentColor;

  border-radius: 100%;

  font-size: 0;

  &:hover,
  &:focus-visible {
    color: var(--color-dark-black);
  }

  &:before {
    content: "";

    position: absolute;

    top: 50%;
    left: 50%;

    width: 100%;
    height: 100%;

    transform: scale(0.1) translate3d(-50%, -50%, 0);
    transform-origin: top left;

    background-color: currentColor;

    border-radius: 100%;

    transition: {
      duration: 0.25s;
      property: transform;
    }
  }

  &.active:before {
    transform: scale(1.1) translate3d(-50%, -50%, 0);
  }

  @include tablet {
    position: relative;

    float: unset;

    top: 0;
    right: 0;
  }
}
</style>
