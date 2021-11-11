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
  mounted() {
    this.getCurrent();
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
        const activeDevice = devices.find((d) => d.is_active);
        this.deviceId = activeDevice ? activeDevice.id : devices[0].id;
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
      this.getCurrent();
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
      const { is_playing, item, progress_ms, context } =
        await this.spotify.getMyCurrentPlaybackState();

      if (!context || context.uri !== this.playlistUri) {
        this.$store.commit("queue/resetQueue");
      }

      this.currentlyPlaying = item.id;
      const playingIndex = this.queue.findIndex(
        (row) => row.spotify_id === item.id
      );
      this.$store.commit("queue/setQueuePosition", playingIndex);

      this.$store.commit("player/setSongDetails", {
        id: this.songs.find((row) => row.spotify_id === item.id)?.id || -1,
        title: item.name,
        artists: item.artists.map((a) => a.name),
        spotify_id: item.id,
      });

      this.$store.commit("player/togglePlay", is_playing);
      this.$store.commit("player/toggleShouldPlay", is_playing);
      this.$store.commit(
        "player/setPlayerPercentage",
        progress_ms / item.duration_ms
      );

      if (is_playing) {
        this.updateTimer = setTimeout(() => this.getCurrent(), 10000);
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
    playing() {
      return this.$store.state.player.playing;
    },

    songs() {
      return this.$store.state.liked.songs;
    },
    queue() {
      return this.$store.state.queue.items;
    },
    queueUris() {
      return this.queue.map((item) => item.spotify_id);
    },

    position() {
      return this.$store.state.queue.position;
    },

    spotify() {
      return this.$store.state.spotify.object;
    },
  },
  watch: {
    shouldPlay(val) {
      if (val) {
        this.play();
      } else {
        this.pause();
      }
    },
    position(val) {
      if (
        typeof val !== "undefined" &&
        val >= 0 &&
        this.queue[val].id !== this.currentlyPlaying
      ) {
        this.playSong(this.queue[val]);
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
