<template>
  <div class="hider">
    <client-only>
      <Youtube
        v-if="videoId"
        :video-id="videoId"
        ref="youtube"
        @playing="onPlaying"
        @pause="onPause"
        @error="onError"
        @unable="onUnable"
        @end="onEnd"
        @timechange="onTime"
      />

      <SpotifyPreview v-if="previewSrc" :src="previewSrc" />
    </client-only>
  </div>
</template>

<script>
import getYouTubeID from "get-youtube-id";
import Youtube from "./common/Youtube.vue";
import { timer } from "~/assets/js/utils";
import { TOAST_TYPE } from "~/store/toast";
import SpotifyPreview from "./SpotifyPreview.vue";

const truncate = (txt, len = 30) => {
  if (txt.length > len) {
    return txt.substring(0, len - 3) + "...";
  }

  return txt;
};

export default {
  components: { Youtube, SpotifyPreview },
  data() {
    return {
      previewSrc: null,
      playerVars: {
        autoplay: 1,
        modestbranding: 0,
        rel: 0,
        showinfo: 0,
        disablekb: 1,
        playsinline: 1,
      },
    };
  },
  methods: {
    onTime(percentage) {
      this.$store.commit("player/setPlayerPercentage", percentage);
    },
    onPlaying() {
      this.$store.commit("player/togglePlay", true);
    },
    onPause() {
      this.$store.commit("player/togglePlay", false);
    },
    onError(e) {
      console.log(e);
    },
    async onUnable() {
      let currentId = this.currentSong.id;

      const duration = this.currentSong.preview ? 30000 : 4000;

      this.$store.commit("toast/addToast", {
        type: TOAST_TYPE.ERROR,
        message: `Some songs are unfortunately not able to be played ${
          this.currentSong.preview ? "fully" : "embedded"
        } on this site.\n\nConnect to spotify to listen to all of the songs seamlessly.`,
        action: {
          to: `https://youtube.com/watch?v=${this.videoId}`,
          label: `Open '${truncate(this.currentSong.title)}' on Youtube ⟶`,
        },
        duration,
        callback: (id) => {
          this.unableToast = id;
        },
      });

      if (this.currentSong.preview) {
        this.previewSrc = this.currentSong.preview;
      }

      this.unableTimer = setTimeout(() => {
        if (this.currentSong.id === currentId) {
          this.next();
        }
      }, duration);
    },
    onEnd() {
      this.next();
    },
    next() {
      this.$store.commit("queue/nextSong");
    },
    checkGuard() {
      return new Promise((resolve) => {
        if (this.$refs.youtube && this.$refs.youtube.ready) {
          resolve();
          return;
        }

        return timer(50).then(() => this.checkGuard());
      });
    },
    async play() {
      await this.checkGuard();
      await this.player.playVideo();
    },
    async pause() {
      await this.checkGuard();
      await this.player.pauseVideo();
    },
  },
  computed: {
    shouldPlay() {
      return this.$store.state.player.shouldPlay;
    },
    queue() {
      return this.$store.state.queue.items;
    },
    position() {
      return this.$store.state.queue.position;
    },
    currentSong() {
      return this.queue[this.position];
    },
    videoId() {
      return this.currentSong
        ? getYouTubeID(this.currentSong.youtube_link)
        : false;
    },
    player() {
      return this.$refs.youtube.player;
    },
  },
  watch: {
    position(val) {
      const item = this.queue[val];
      this.$store.commit("player/setSongDetails", {
        id: item.id,
        title: item.title,
        artists: item.artists,
        spotify_id: item.spotify_id,
        youtube_link: item.youtube_link,
      });

      clearTimeout(this.unableTimer);
      this.previewSrc = null;

      if (this.unableToast) {
        this.$store.commit("toast/removeToast", this.unableToast);
        this.unableToast = null;
      }
    },
    videoId() {
      this.play();
    },
    shouldPlay(val) {
      if (val) {
        this.play();
      } else {
        this.pause();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.hider {
  display: none;
}
</style>
