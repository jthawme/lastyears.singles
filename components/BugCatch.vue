<template>
  <div class="backdrop">
    <div class="bug">
      <h1>OH NO</h1>
      <p>
        There is a bug with Spotify at the moment, that stops music being played
        directly from the site on mobile devices.
      </p>
      <p>
        If you
        <a href="https://open.spotify.com/" target="_blank">open spotify</a> and
        play ANY song, then return to the site and refresh, the site will work.
      </p>
      <p>Sorry for how lame that is. :(</p>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.backdrop {
  position: fixed;

  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  background-color: var(--color-bg);

  z-index: 100;

  h1 {
    font-size: 24vw;

    margin: 0 0 1rem;
  }

  p {
    a {
      color: green;
    }

    max-width: 320px;
  }
}

.bug {
  position: absolute;

  top: var(--page-padding-y);
  right: var(--page-padding-x);
  bottom: var(--page-padding-y);
  left: var(--page-padding-x);

  padding: var(--page-padding);

  color: var(--color-bg);
  background-color: var(--color-active);
}
</style>
