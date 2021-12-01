<template>
  <div>
    <DiscreetNav />

    <youtube-player v-if="isYoutubeControl" />
    <spotify-player v-if="isSpotifyControl" />

    <main :class="{ hide: idle && playing && displayVisual }">
      <nuxt />
    </main>

    <transition name="fade" mode="out-in">
      <squares v-if="isSource('pitchfork') && displayVisual" />
      <circles v-if="isSource('nme') && displayVisual" />
      <Field v-if="isSource('the-fader') && displayVisual" />
      <shift-squares v-if="isSource('billboard') && displayVisual" />
      <Ticking v-if="isSource('npr') && displayVisual" />
    </transition>

    <MainBar />

    <Toast />
  </div>
</template>


<script>
import smoothscroll from "smoothscroll-polyfill";
import {
  listenCb,
  registerBootlegVH,
  tickUpdate,
  timer,
} from "../assets/js/utils";
import { SpotifyMixin } from "../assets/js/spotifyMixin";
import { SavedMixin } from "../assets/js/saveMixin";
import { BreakPointSet } from "../assets/js/mixins/breakpoints";
import MainBar from "~~/components/MainBar.vue";
import DiscreetNav from "~~/components/DiscreetNav.vue";
import Squares from "~/components/Animations/Squares.vue";
import YoutubePlayer from "~/components/YoutubePlayer.vue";
import SpotifyPlayer from "~/components/SpotifyPlayer.vue";
import { PLAYER_CONTROL } from "~/store/player";
import Circles from "~/components/Animations/Circles.vue";
import Field from "~/components/Animations/Field.vue";
import ShiftSquares from "~/components/Animations/ShiftSquares.vue";
import { getItem } from "~/assets/js/localStorage";
import { EGO_KEY } from "~/assets/js/constants";
import Toast from "~/components/common/Toast.vue";
import Ticking from "~/components/Animations/Ticking.vue";

const SITE_TITLE = "Last Years Singles";

export default {
  components: {
    MainBar,
    DiscreetNav,
    Squares,
    YoutubePlayer,
    SpotifyPlayer,
    Circles,
    Field,
    ShiftSquares,
    Toast,
    Ticking,
  },
  mixins: [BreakPointSet, SpotifyMixin, SavedMixin],
  head() {
    const playing = this.playing;
    return {
      title: this.title,
      titleTemplate: (titleChunk) => {
        // If undefined or blank then we don't need the hyphen
        return titleChunk && titleChunk !== SITE_TITLE
          ? `${playing ? "🎵 " : ""}${titleChunk} - ${SITE_TITLE}`
          : `${playing ? "🎵 " : ""}${SITE_TITLE}`;
      },
    };
  },
  data() {
    return {
      idleTimer: -1,
    };
  },
  mounted() {
    const ego = getItem(EGO_KEY, true);
    if (ego) {
      this.$store.commit("setEgoTrip", true);
    }

    smoothscroll.polyfill();

    registerBootlegVH();

    listenCb(document, "mousemove", tickUpdate(this.idleChecker.bind(this)));
    listenCb(document, "scroll", tickUpdate(this.idleChecker.bind(this)));
  },
  computed: {
    playerControl() {
      return this.$store.state.player.playerControl;
    },
    isYoutubeControl() {
      return this.playerControl === PLAYER_CONTROL.YOUTUBE;
    },
    isSpotifyControl() {
      return this.playerControl === PLAYER_CONTROL.SPOTIFY;
    },
    idle() {
      return this.$store.state.idle;
    },
    playing() {
      return this.$store.state.player.playing;
    },
    queueSource() {
      return this.$store.state.queue.source;
    },
    displayVisual() {
      return this.$store.state.displayVisual;
    },
  },
  methods: {
    isSource(source) {
      return this.queueSource && this.queueSource.includes(source);
    },
    idleChecker() {
      clearTimeout(this.idleTimer);
      this.$store.commit("setIdle", false);
      this.idleTimer = setTimeout(() => {
        this.$store.commit("setIdle", true);
      }, 7500);
    },
  },
};
</script>

<style lang="scss">
@import "../assets/scss/parts/fonts";

:root {
  --color-white: #b7babb;
  --color-black: #272727;
  --color-dark-black: #000000;
  --color-active: #fdd835;

  --color-text: var(--color-white);
  --color-bg: var(--color-black);

  --font-size-x-small: 10px;
  --font-size-small: 14px;
  --font-size-normal: 16px;
  --font-size-medium: 21px;
  --font-size-large: 24px;
  --font-size-x-large: 36px;
  --font-size-xx-large: 46px;
  --font-size-xxx-large: 56px;

  --font-family-body: "GT Cinetype", sans-serif;
  --font-family-headline: "GT Cinetype", sans-serif;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-weight-extra-bold: 900;

  --icon-small: 1em;

  --page-padding-x: 20px;
  --page-padding-y: 16px;
  --page-padding: var(--page-padding-y) var(--page-padding-x);

  @for $i from 1 through 20 {
    --size-unit-#{$i}: #{$i * 5px};
  }

  @include tablet {
    --page-padding-x: 70px;
    --page-padding-y: 32px;
    --page-padding: var(--page-padding-y) var(--page-padding-x);
  }
}

// ::-webkit-scrollbar {
//   width: 0px; /* remove scrollbar space */
//   background: transparent; /* optional: just make scrollbar invisible */
// }

*,
*:before,
*:after {
  box-sizing: border-box;
}

html {
  font-family: var(--font-family-body);
  font-size: var(--font-size-normal);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);

  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;

  background-color: var(--color-bg);

  line-height: 1.25;
}

input,
button {
  font-family: inherit;
  font-weight: inherit;
}

html,
body {
  width: 100%;
  min-height: 100%;
}

.visually-hidden {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.fade {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.fade-fast {
  opacity: 1;
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.5s;
}
.fade-fast-enter, .fade-fast-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

img {
  max-width: 100%;
}

main {
  position: relative;

  z-index: 2;

  padding-bottom: 100px;

  transition: {
    duration: 1s;
    property: opacity;
  }

  &.hide {
    opacity: 0;
  }
}

a.std {
  display: block;
  color: inherit;

  text-decoration: none;

  &:hover,
  &:focus-visible {
    color: var(--color-dark-black);
  }
}
</style>
