<template>
  <a :href="url" class="outer" @click="onClick">
    <span class="spotify">Connect spotify <span class="why">?</span></span>

    <div class="explanation">
      Connect your spotify to enable liked songs to to go directly to your
      account and play via your own player.

      <span class="cta">Click to connect ⟶</span>
    </div>
  </a>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  methods: {
    onClick() {
      plausible("Spotify Connect", { props: { status: "initiate" } });
    },
  },
};
</script>

<style lang="scss" scoped>
.outer {
  position: relative;

  z-index: 5;

  text-decoration: none;
  display: block;

  --spotify-green: green;

  width: 100%;
  background-color: var(--spotify-green);

  padding: var(--page-padding);
  margin-bottom: var(--page-padding-y);

  &:hover,
  &:focus-within {
    .spotify {
      color: var(--color-text);
    }

    .why {
      color: var(--spotify-green);
      background-color: var(--color-text);
    }

    .explanation {
      visibility: visible;
      opacity: 1;
    }
  }

  @include tablet {
    width: auto;
    background-color: transparent;
    padding: 0;
    margin: 0;
  }
}

.spotify {
  position: relative;

  display: flex;

  align-items: center;

  margin-right: 1em;

  text-decoration: none;
  color: var(--color-text);

  z-index: 5;

  .why {
    display: none;
    align-items: center;
    justify-content: center;

    font-size: var(--font-size-x-small);

    width: 14px;
    height: 14px;

    margin-left: 4px;

    border-radius: 100%;

    color: var(--color-bg);
    background-color: var(--spotify-green);
  }

  @include tablet {
    margin-right: 1em;
    color: var(--spotify-green);

    .why {
      display: inline-flex;
    }
  }
}

.explanation {
  // border: 1px solid var(--color-text);
  // background-color: var(--color-bg);
  background-color: var(--spotify-green);

  color: var(--color-text);
  padding: 1em 0 0;

  font-size: var(--font-size-small);

  max-width: 280px;

  .cta {
    display: block;

    padding-top: 1em;

    color: var(--color-bg);
  }

  @include tablet {
    position: absolute;

    right: 0.5em;
    top: -0.5em;

    padding: 2.5em 1em 1em;
    width: 320px;
    visibility: hidden;
    opacity: 0;

    font-size: var(--font-size-normal);
  }
}
</style>
