<script>
const STATUS = {
  READY: "ready",
  OFFLINE: "offline",
};

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
    this.mountPlayerSdk();
    this.getCurrent();
  },
  methods: {
    mountPlayerSdk() {
      if (!document.querySelector("#playersdk")) {
        window.onSpotifyWebPlaybackSDKReady =
          this.onSpotifyWebPlaybackSDKReady.bind(this);

        const scriptEl = document.createElement("script");
        scriptEl.id = "playersdk";
        scriptEl.src = `https://sdk.scdn.co/spotify-player.js`;
        document.body.appendChild(scriptEl);
      }
    },
    onSpotifyWebPlaybackSDKReady() {
      this.webPlayer = new Spotify.Player({
        name: "Music Lists",
        getOAuthToken: (cb) => {
          cb(this.spotifyToken);
        },
        volume: 1,
      });

      this.webPlayer.addListener("ready", ({ device_id }) => {
        this.internalDevice = {
          id: device_id,
          status: STATUS.READY,
        };
      });

      this.webPlayer.addListener("not_ready", ({ device_id }) => {
        this.internalDevice = {
          status: STATUS.OFFLINE,
        };
      });

      this.webPlayer.connect();
    },
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
      const { devices } = await this.spotify.getMyDevices();

      if (this.deviceId) {
        const oldDevice = devices.find((d) => d.id === this.deviceId);

        if (!oldDevice || !oldDevice.active) {
          this.deviceId = null;
        }
      }

      if (!this.deviceId) {
        const getActiveId = () => {
          const activeDevice = devices.find((d) => d.is_active);

          if (activeDevice) {
            return activeDevice.id;
          }

          if (
            this.internalDevice &&
            this.internalDevice.status === STATUS.READY
          ) {
            return this.internalDevice.id;
          }

          return devices[0].id;
        };

        this.deviceId = getActiveId();
      }

      return this.deviceId;
    },
    async getLocalPlayerState() {
      return this.webPlayer.getCurrentState();
    },
    async playSong(song) {
      console.log("running this here! 222");
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
      console.log("running this here!");
      await this.spotify.play();
      this.getCurrent();
    },
    async pause() {
      await this.spotify.pause();
    },
    async getCurrent() {
      clearTimeout(this.updateTimer);

      try {
        const { is_playing, item, progress_ms, context } =
          await this.spotify.getMyCurrentPlaybackState();

        if (!context || context.uri !== this.playlistUri) {
          this.$store.commit("queue/resetQueue");
        }

        if (!item) {
          return;
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
          this.updateTimer = setTimeout(() => this.getCurrent(), 2000);
        }
      } catch (e) {
        console.error("Get current error", e);
      }
    },
  },
  computed: {
    playlists() {
      return this.$store.state.playlists;
    },
    spotifyToken() {
      return this.$store.state.spotify.token;
    },
    source() {
      return this.$store.state.queue.source;
    },
    playlistUri() {
      return this.playlists[this.source] || false;
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
      if (!this.currentlyPlaying) {
        return;
      }
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
