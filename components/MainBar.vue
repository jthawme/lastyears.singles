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
          :class="{ pending: isPendingPlaying, 'action-active': hasQueue }"
        >
          <Icon :name="playing ? 'pause' : 'play'" />
        </button>
        <button class="action" @click="prev" :disabled="!hasPrev">
          <Icon name="skipbackward" />
        </button>
        <button class="action" @click="next" :disabled="!hasNext">
          <Icon name="skipforward" />
        </button>
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
        <button class="action action-highlight">
          <Icon name="add" />
        </button>
      </div>
    </div>

    <div class="percentage" />
  </aside>
</template>

<script>
export default {
  computed: {
    displayVisual() {
      return this.$store.state.player.displayVisual;
    },
    playing() {
      return this.$store.state.player.shouldPlay;
    },
    percentage() {
      return this.$store.state.player.percentage;
    },
    currentSong() {
      return this.$store.state.queue.items.length
        ? this.$store.state.queue.items[this.$store.state.queue.position]
        : false;
    },
    hasQueue() {
      return this.$store.state.queue.items.length > 0;
    },
    artist() {
      if (!this.currentSong) {
        return "";
      }

      const [lead, ...rest] = this.currentSong.artists;
      return `${lead}${rest.length ? ` (ft. ${rest.join(", ")})` : ""}`;
    },
    isPendingPlaying() {
      return this.playing !== this.$store.state.player.playing;
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
      this.$store.commit("player/toggleDisplayVisual", !this.displayVisual);
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
  height: 1px;

  display: flex;

  padding: 0 70px;
}

.column {
  position: relative;

  &-inner {
    position: absolute;

    width: 100%;

    display: flex;
    align-items: flex-end;

    bottom: 32px;
  }

  &-one {
    flex-basis: 25%;
  }

  &-two {
    flex-basis: 150px;
  }

  &-three {
    flex-grow: 1;

    .column-inner {
      bottom: 30px;
    }
  }

  &-four {
    flex-basis: 50px;

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

  &.pending {
    animation: {
      name: BLINK;
      duration: 1s;
      iteration-count: infinite;
      direction: alternate;
    }
  }

  &[disabled] {
    opacity: 0.2;
  }

  &-active:before {
    content: "";

    position: absolute;

    width: 0.2em;
    height: 0.2em;

    bottom: calc(100% + 8px);
    left: 50%;

    transform: translate3d(-50%, 0, 0);

    background-color: currentColor;
    border-radius: 100%;
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
</style>

