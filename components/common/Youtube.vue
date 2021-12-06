<template>
  <div ref="player" />
</template>

<script>
import { timer } from "~/assets/js/utils";

const getYoutube = () => {
  return new Promise((resolve) => {
    import("youtube-iframe").then(({ default: YouTubeIframeLoader }) =>
      YouTubeIframeLoader.load((yt) => resolve(yt))
    );
  });
};

export default {
  props: {
    videoId: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    shouldPlay() {
      return this.$store.state.player.shouldPlay;
    },
  },
  async mounted() {
    this.YT = await getYoutube();

    if (this.videoId) {
      this.loadOrCreate();
    }
  },
  data() {
    return {
      ready: false,
    };
  },
  watch: {
    videoId(val) {
      this.loadOrCreate();
    },
  },
  methods: {
    updateTime() {
      clearTimeout(this.timeUpdateId);
      this.$emit(
        "timechange",
        this.player.getCurrentTime() / this.player.getDuration()
      );

      this.timeUpdateId = setTimeout(() => this.updateTime(), 500);
    },
    onPlayerReady() {
      this.ready = true;

      if (this.shouldPlay) {
        this.player.playVideo();
        // Do this in case the initial video is unable. It doesnt report it as an error
        this.checkTimer = setTimeout(() => {
          this.$emit("unable");
        }, 5000);
      }
    },
    onPlayerStateChange(event) {
      clearTimeout(this.timeUpdateId);
      clearTimeout(this.checkTimer);

      if (event.data == this.YT.PlayerState.PLAYING) {
        this.updateTime();

        this.$emit("playing");
      }

      if (event.data == this.YT.PlayerState.PAUSED) {
        this.$emit("pause");
      }
      if (event.data == this.YT.PlayerState.ENDED) {
        this.$emit("end");
      }
    },
    onPlayerError(event) {
      if (event.data === 101 || event.data === 150) {
        this.$emit("unable");
      } else {
        this.$emit("error", event.data);
      }
    },
    loadOrCreate() {
      if (!this.YT) {
        return;
      }

      if (!this.player) {
        this.player = new this.YT.Player(this.$el, {
          height: "390",
          width: "640",
          videoId: this.videoId,
          playerVars: {
            modestbranding: 0,
            rel: 0,
            showinfo: 0,
            disablekb: 1,
            playsinline: 1,
            autoplay: 1,
          },
          events: {
            onReady: this.onPlayerReady,
            onStateChange: this.onPlayerStateChange,
            onError: this.onPlayerError,
          },
        });
      } else if (!this.ready) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.loadOrCreate();
        }, 250);
      } else {
        this.player.loadVideoById(this.videoId);
      }
    },
    ensureLoaded() {
      return new Promise((resolve, reject) => {
        const check = (times) => {
          if (times > 10) {
            reject("Error loading youtube api");
            return;
          }

          if (!this.ready) {
            timer(100).then(() => check(times + 1));
          } else {
            resolve();
          }
        };
        check(0);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
