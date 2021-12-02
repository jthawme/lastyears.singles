<template>
  <div class="share">
    <a @click="onClick" target="_blank" class="large" :href="twitterURL"
      >SHARE</a
    >
    <a @click="onClick" target="_blank" class="large" :href="twitterURL"
      >SHARE</a
    >
    <a @click="onClick" target="_blank" class="large" :href="twitterURL"
      >SHARE</a
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: "Give new music a chance",
      url: "https://lastyears.singles",
      via: "jthawme",
    };
  },
  computed: {
    twitterURL() {
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        this.text
      )}&url=${encodeURIComponent(this.url)}&via=${this.via}`;
    },
  },
  methods: {
    async onClick(e) {
      if (navigator.share) {
        e.preventDefault();

        try {
          await navigator.share({
            text: this.text,
            url: this.url,
            title: "Last Years Singles",
          });
        } catch {
          window.open(this.twitterURL, "_blank");
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.share {
  line-height: 0.9;

  padding: 4em 0;

  text-align: center;
}

.large {
  display: block;

  text-decoration: none;
  font-size: calc(32vw - var(--page-padding-x));

  color: var(--color-text);

  &:hover,
  &:focus-visible {
    color: var(--color-active);
  }

  @include tablet {
    font-size: calc(34vw - var(--page-padding-x));
  }
}
</style>
