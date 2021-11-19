<template>
  <aside :style="{ '--percentage': percentage }">
    <div class="column column-one">
      <div class="column-inner">
        <button
          @click="toggleDisplayVisual"
          class="action"
          :class="{ 'action-active': displayVisual }"
        >
          <Icon name="layers" />
        </button>
      </div>
    </div>

    <div class="column column-two">
      <div class="column-inner">
        <button
          class="action"
          @click="togglePlaying"
          :class="{
            pending: isPendingPlaying,
            'action-active': queue.length > 0,
          }"
        >
          <Icon :name="playing ? 'pause' : 'play'" />
        </button>
        <button class="action" @click="prev" :disabled="!hasPrev">
          <Icon name="skipbackward" />
        </button>
        <button class="action" @click="next" :disabled="!hasNext">
          <Icon name="skipforward" />
        </button>
        <a
          target="_blank"
          v-if="externalLink"
          :href="externalLink"
          class="action action-active"
          :class="{ 'action-spotify': !isYoutube }"
        >
          <Icon v-if="isYoutube" name="open" />
          <SpotifyLogo v-else class="spotify" />
        </a>
      </div>
    </div>

    <div class="column column-three">
      <div class="column-inner" v-if="currentSong">
        {{ currentSong.title }}<br />
        {{ artist }}
      </div>
    </div>

    <div class="column column-four">
      <div class="column-inner">
        <button
          class="action action-highlight"
          :class="{ 'action-highlight-active': isLikedSong }"
          v-if="currentInternalSong"
          @click="toggleLikedSong"
        >
          <Icon name="add" />
        </button>
      </div>
    </div>

    <div class="percentage" v-if="isYoutube" />
  </aside>
</template>

<script>
import { SaveMixin } from "~/assets/js/saveMixin";
import { PLAYER_CONTROL } from "~/store/player";
import SpotifyLogo from "~/assets/img/spotify-icon.svg?inline";

export default {
  components: { SpotifyLogo },
  mixins: [SaveMixin],
  computed: {
    playerControl() {
      return this.$store.state.player.playerControl;
    },
    isYoutube() {
      return this.playerControl === PLAYER_CONTROL.YOUTUBE;
    },
    displayVisual() {
      return this.$store.state.displayVisual;
    },

    playing() {
      return this.$store.state.player.shouldPlay;
    },
    isPendingPlaying() {
      return this.playing !== this.$store.state.player.playing;
    },

    percentage() {
      return this.$store.state.player.percentage;
    },

    songs() {
      return this.$store.state.liked.songs;
    },
    liked() {
      return this.$store.state.liked.items;
    },
    queue() {
      return this.$store.state.queue.items;
    },
    currentSong() {
      return this.$store.state.player.song;
    },
    isLikedSong() {
      return this.currentSong
        ? this.liked.includes(this.currentSong.id)
        : false;
    },
    currentInternalSong() {
      return (
        this.currentSong && this.songs.find((r) => r.id === this.currentSong.id)
      );
    },
    externalLink() {
      if (!this.currentSong) {
        return false;
      }

      if (this.currentSong.youtube_link) {
        return this.currentSong.youtube_link;
      }
      if (this.currentSong.spotify_id) {
        return `spotify:track:${this.currentSong.spotify_id}`;
      }

      return false;
    },
    artist() {
      if (!this.currentSong) {
        return "";
      }

      const [lead, ...rest] = this.currentInternalSong
        ? this.currentInternalSong.artists
        : this.currentSong.artists;

      if (this.currentSong.title.toLowerCase().includes("feat. ")) {
        return lead;
      }
      return `${lead}${rest.length ? ` (ft. ${rest.join(", ")})` : ""}`;
    },

    hasNext() {
      return (
        this.$store.state.queue.position <
        this.$store.state.queue.items.length - 1
      );
    },
    hasPrev() {
      return this.$store.state.queue.position > 0;
    },
  },
  methods: {
    toggleDisplayVisual() {
      this.$store.commit("toggleDisplayVisual", !this.displayVisual);
    },
    togglePlaying() {
      this.$store.commit("player/toggleShouldPlay", !this.playing);
    },
    next() {
      this.$store.commit("queue/nextSong");
    },
    prev() {
      this.$store.commit("queue/prevSong");
    },
    toggleLikedSong() {
      if (!this.currentInternalSong) {
        return;
      }

      this.toggleLikeSong(
        this.currentInternalSong.id,
        this.currentInternalSong.spotify_id
      );
    },
  },
};
</script>

<style lang="scss" scoped>
aside {
  position: fixed;

  bottom: 0;
  left: 0;

  z-index: 5;

  width: 100%;

  display: grid;

  padding: 0 var(--page-padding-x) calc(var(--page-padding-y) * 1.5);

  grid-template-columns: 30px 1fr 30px;
  grid-template-areas:
    "current current current"
    "layers actions save";

  @include tablet {
    display: flex;
    height: 1px;
    padding: 0 var(--page-padding-x);
  }
}

.column {
  position: relative;

  &-inner {
    width: 100%;

    display: flex;
    align-items: flex-end;

    @include tablet {
      position: absolute;
      bottom: 32px;
    }
  }

  &-one {
    flex-basis: 25%;
    grid-area: layers;
  }

  &-two {
    flex-basis: 150px;
    grid-area: actions;
    .column-inner {
      justify-content: center;

      @include tablet {
        justify-content: flex-start;
      }
    }
  }

  &-three {
    flex-grow: 1;
    grid-area: current;

    padding-bottom: 1em;
    font-size: var(--font-size-small);

    .column-inner {
      color: var(--color-active);
    }

    @include tablet {
      font-size: var(--font-size-normal);
      padding-bottom: 0;

      .column-inner {
        bottom: 30px;
      }
    }
  }

  &-four {
    flex-basis: 50px;
    grid-area: save;

    .column-inner {
      justify-content: flex-end;
    }
  }
}

.action {
  -webkit-appearance: none;

  padding: 0.5em;
  margin: -0.5em 0;

  position: relative;

  border: 0;

  color: var(--color-text);

  line-height: 0;

  background-color: transparent;
  outline: 0;

  &-spotify {
    color: white;
  }

  &.pending {
    animation: {
      name: BLINK;
      duration: 1s;
      iteration-count: infinite;
      direction: alternate;
    }
  }

  &[disabled],
  &.disabled {
    opacity: 0.2;
  }

  &-active:before {
    content: "";
    display: none;

    position: absolute;

    width: 0.2em;
    height: 0.2em;

    bottom: calc(100% + 8px);
    left: 50%;

    transform: translate3d(-50%, 0, 0);

    background-color: currentColor;
    border-radius: 100%;

    @include tablet {
      display: block;
    }
  }

  &-highlight:after {
    content: "";

    position: absolute;

    width: 28px;
    height: 28px;

    top: 50%;
    left: 50%;

    border: 0.1em solid currentColor;

    transform: translate3d(-50%, -50%, 0);

    border-radius: 100%;
    z-index: -1;
  }

  &-highlight-active {
    color: var(--color-bg);

    &:after {
      border: 0.1em solid var(--color-text);
      background-color: var(--color-text);
    }
  }

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    cursor: pointer;
    color: black;
  }
}

.percentage {
  position: absolute;

  bottom: 0;
  left: 0;

  width: 100%;
  height: 6px;

  transform: scaleX(var(--percentage, 0));
  transform-origin: bottom left;

  background-color: currentColor;

  transition: {
    duration: 0.05s;
    property: transform;
  }
}

@keyframes BLINK {
  to {
    opacity: 0.5;
  }
}

.action-spotify {
  margin: -0.65em ​0;

  &:before {
    bottom: calc(100% + 6px);
  }
}

.spotify {
  height: 21px;
}
</style>

