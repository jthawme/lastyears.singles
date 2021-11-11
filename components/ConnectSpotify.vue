<template>
  <a :href="url" class="outer">
    <span class="spotify">Connect spotify <span class="why">?</span></span>

    <div class="explanation">
      Connect your spotify to enable liked songs to to go directly to your
      account and play via your own player.
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
};
</script>

<style lang="scss" scoped>
.outer {
  position: relative;
  text-decoration: none;

  --spotify-green: green;

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
}

.spotify {
  position: relative;

  display: flex;

  align-items: center;

  margin-right: 1em;

  text-decoration: none;
  color: var(--spotify-green);

  z-index: 5;

  .why {
    display: inline-flex;

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
}

.explanation {
  position: absolute;

  right: 0.5em;
  top: -0.5em;

  padding: 2.5em 1em 1em;

  // border: 1px solid var(--color-text);
  // background-color: var(--color-bg);
  background-color: var(--spotify-green);

  width: 320px;
  visibility: hidden;
  opacity: 0;

  color: var(--color-text);
}
</style>
