<template>
  <div class="outer">
    <h2>About</h2>

    <div class="content">
      <p>
        Honestly, I am a fan of the end of year lists from music sites. Reviews
        definitely should always be taken with a pinch of salt, I think a lot of
        reviews people are hoping to get some sort of validation for something
        they already think, rather than actually being influenced from the
        review themselves, but thats fine too. But I’ve definitely found that
        some lists upon reflection have actually contained a lot more music that
        I have grown to love over the subsequent years, which made me want to
        give them an unbiased focus each year. I am also a sucker for the
        arbitrary pivotal point of a new year, so I like bookending the year
        with music also. It started with Pitchfork and I like that other sites
        have jumped in on it, they each have their own agendas (I always felt
        like Pitchfork’s #2 was really their #1 but their #1 was whoever they
        wanted to have their image associated to) and their own genres so its
        all a little different, like an interestingly curated radio show.
      </p>

      <p>
        The site was made in valuable free time when I should have been
        relaxing. Made by
        <a href="https://jthaw.me" target="_blank">jthaw.me</a>. Get the site’s
        code on github
        <a href="https://github.com/jthawme/lastyears.singles" target="_blank"
          >here</a
        >.
      </p>

      <p>Do the Konami code on the home page for an easter ego (not a typo).</p>
    </div>
  </div>
</template>

<script>
export default {};
</script>


<style lang="scss" scoped>
.outer {
  margin-bottom: 4em;

  h2 {
    font-size: var(--font-size-normal);

    margin: 4em 0;
  }

  .content {
    p {
      margin: 0 0 1em;

      a {
        color: var(--color-active);
      }
    }
  }

  @include tablet {
    .content {
      p {
        max-width: 50%;
      }
    }
  }
}
</style>
