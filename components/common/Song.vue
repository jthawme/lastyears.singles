<template>
  <div
    class="song-link"
    :class="{ interactive, active: isPlaying }"
    :role="interactive ? 'button' : ''"
    :tabindex="interactive && !isPlaying ? 0 : -1"
  >
    <text-mutate
      :text="title"
      class="song-link-text song-link-text--title"
      :speed="1000 + delay"
    />
    <text-mutate
      class="song-link-text song-link-text--artist"
      :text="artist"
      :speed="1200 + delay"
    />
    <div
      v-if="basicPosition"
      class="song-link-position song-link-position--basic"
    >
      {{ basicPosition }}
    </div>
    <!-- <div
      v-if="arrayPosition"
      class="song-link-position song-link-position--complex"
    >
      <span v-for="item in arrayPosition" :key="item.source">
        {{ item.position }}
      </span>
    </div> -->
    <div
      v-if="arrayPosition"
      class="song-link-position song-link-position--complex"
    >
      {{ arrayPosition }} ({{ positions.length }})
    </div>
  </div>
</template>

<script>
import TextMutate from "./TextMutate.vue";
export default {
  components: { TextMutate },
  props: {
    interactive: {
      type: Boolean,
      default: true,
    },
    delay: {
      type: Number,
      default: 0,
    },
    id: {
      type: [Number, String],
      required: true,
    },
    spotify_id: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    artists: {
      type: Array,
      required: true,
    },
    youtube_link: {
      type: String,
      required: true,
    },
    positions: {
      type: [Number, Array],
      validator(val) {
        if (typeof val === "number") {
          return true;
        }

        return val.every((item) => item.position && item.source);
      },
      required: false,
    },
  },
  computed: {
    currentSong() {
      return this.$store.state.player.song;
    },
    isPlaying() {
      return this.currentSong?.id === this.id;
    },
    artist() {
      const [lead, ...rest] = this.artists;
      return `${lead}${rest.length ? ` (ft. ${rest.join(", ")})` : ""}`;
    },
    basicPosition() {
      return typeof this.positions === "number" && this.positions;
    },
    arrayPosition() {
      return (
        Array.isArray(this.positions) &&
        Math.round(
          (this.positions.reduce((prev, curr) => prev + curr.position, 0) /
            this.positions.length) *
            10
        ) / 10
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.song-link {
  position: relative;

  cursor: pointer;

  outline: 0;

  &.active {
    color: var(--color-active);

    &:before {
      content: "";

      position: absolute;

      right: calc(100% + (1em / 2));
      top: calc(1em / 2);

      border-radius: 100%;

      width: 5px;
      height: 5px;

      background-color: currentColor;
    }
  }

  &:not(.active):hover,
  &:not(.active):focus-visible {
    color: black;
  }

  &-position {
    color: black;
  }

  &-position--complex {
    display: flex;

    span {
      display: block;

      &:not(:last-child):after {
        content: " /";
        margin-right: 0.4em;
      }
    }
  }
}
</style>
