<script>
import { PLAYLISTS } from "~/assets/js/songs";
export default {
  render() {
    return null;
  },
  data() {
    return {
      deviceId: null,
      currentlyPlaying: null,
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
    async getDeviceId() {
      if (!this.deviceId) {
        const { devices } = await this.spotify.getMyDevices();
        this.deviceId = devices[0].id;
      }

      return this.deviceId;
    },
    async playSong(song) {
      if (!this.playlistUri && this.source !== "your-songs") {
        return;
      }

      const deviceId = await this.getDeviceId();
      this.currentlyPlaying = song.spotify_id;

      const opts = {};

      if (this.playlistUri) {
        opts.context_uri = this.playlistUri;
      }
      if (this.source === "your-songs") {
        opts.uris = this.queueUris.map((uri) => `spotify:track:${uri}`);
      }

      await this.spotify.play({
        ...opts,
        device_id: deviceId,
        offset: {
          position: this.queueUris.findIndex((uri) => song.spotify_id === uri),
        },
      });
    },
    async play() {
      await this.spotify.play();
      this.getCurrent();
    },
    async pause() {
      await this.spotify.pause();
    },
    async getCurrent() {
      clearTimeout(this.updateTimer);
      const { is_playing, item, progress_ms, context, ...rest } =
        await this.spotify.getMyCurrentPlaybackState();

      this.currentlyPlaying = item.id;
      this.$store.commit(
        "queue/setQueuePosition",
        this.queue.findIndex((row) => row.spotify_id === item.id)
      );

      this.$store.commit("player/togglePlay", is_playing);
      this.$store.commit("player/toggleShouldPlay", is_playing);
      this.$store.commit(
        "player/setPlayerPercentage",
        progress_ms / item.duration_ms
      );

      if (is_playing) {
        this.updateTimer = setTimeout(() => this.getCurrent(), 2500);
      }
    },
  },
  computed: {
    source() {
      return this.$store.state.queue.source;
    },
    playlistUri() {
      return PLAYLISTS[this.source] || false;
    },
    shouldPlay() {
      return this.$store.state.player.shouldPlay;
    },
    queue() {
      return this.$store.state.queue.items;
    },
    queue() {
      return this.$store.state.queue.items;
    },
    queueUris() {
      return this.queue.map((item) => item.spotify_id);
    },
    playing() {
      return this.$store.state.player.playing;
    },
    currentSong() {
      return this.$store.state.queue.items.length
        ? this.$store.state.queue.items[this.$store.state.queue.position]
        : false;
    },
    spotify() {
      return this.$store.state.spotify.object;
    },
  },
  watch: {
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
    currentSong(newSong, oldSong) {
      if (newSong && newSong.spotify_id !== this.currentlyPlaying) {
        this.playSong(newSong);
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
