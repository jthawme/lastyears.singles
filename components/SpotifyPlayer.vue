<script>
import { getSpotifyAuthoriseUrl } from "~/assets/js/spotify";
import { SpotifyTokenMixin } from "~/assets/js/spotifyTokenMixin";
import { listenCb } from "~/assets/js/utils";
import platform from "platform";

const STATUS = {
  READY: "ready",
  OFFLINE: "offline",
};

export default {
  render() {
    return null;
  },
  mixins: [SpotifyTokenMixin],
  data() {
    return {
      debug: false,
      deviceId: null,
      currentlyPlaying: null,
    };
  },
  mounted() {
    this.debug = window.location.host.includes("localhost");
    this.getCurrent();
    this.mountPlayerSdk();
  },
  methods: {
    // async checkDeviceBug() {
    //   let deviceId = null;
    //   try {
    //     deviceId = await this.getDeviceId();
    //   } catch {
    //   } finally {
    //     if (!deviceId) {
    //       if (
    //         platform.os.family === "iOS" ||
    //         platform.os.family === "Android"
    //       ) {
    //         console.log("set during check device bug");
    //         this.$store.commit("setBugCatch", true);
    //       }
    //     }
    //   }
    // },
    deviceError() {
      if (platform.os.family === "iOS" || platform.os.family === "Android") {
        console.log("set during deviceError");
        this.$store.commit("setBugCatch", true);
        return;
      }
    },
    autoPlayHack() {
      const unlisten = listenCb(document, "click", () => {
        this.webPlayer.activateElement();
        unlisten();
      });
    },
    mountPlayerSdk() {
      this.log("[Running] mountPlayerSdk");
      if (!document.querySelector("#playersdk")) {
        window.onSpotifyWebPlaybackSDKReady =
          this.onSpotifyWebPlaybackSDKReady.bind(this);

        const scriptEl = document.createElement("script");
        scriptEl.id = "playersdk";
        scriptEl.src = `https://sdk.scdn.co/spotify-player.js`;
        scriptEl.onerror = () => {
          this.deviceError();
        };
        document.body.appendChild(scriptEl);
      }
    },
    onSpotifyWebPlaybackSDKReady() {
      this.log("[Running] onSpotifyWebPlaybackSDKReady");
      this.webPlayer = new Spotify.Player({
        name: "lastyears.singles",
        getOAuthToken: async (cb) => {
          const token = await this.refreshToken(this.spotifyRefreshToken);
          cb(token);
        },
        volume: 1,
      });

      this.webPlayer.addListener("ready", ({ device_id }) => {
        // weird no audio fix
        const iframe = document.querySelector(
          'iframe[src="https://sdk.scdn.co/embedded/index.html"]'
        );

        if (iframe) {
          iframe.style.display = "block";
          iframe.style.position = "absolute";
          iframe.style.top = "-1000px";
          iframe.style.left = "-1000px";
        }

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

      this.webPlayer.addListener("autoplay_failed", () => {
        console.log("Autoplay is not allowed by the browser autoplay rules");
        this.autoPlayHack();
      });

      this.webPlayer.on("initialization_error", ({ message }) => {
        plausible("Spotify Error", { props: { message } });

        this.deviceError();
      });

      this.webPlayer.on("authentication_error", (e) => {
        if (
          e.message === "Browser prevented autoplay due to lack of interaction"
        ) {
          this.autoPlayHack();
          return;
        }
        this.setupAuthorise();

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.$store.commit("toast/addToast", {
              message:
                "Connection to spotify failed, connect again to continue!",
              action: {
                to: this.$store.state.spotify.spotifyAuthoriseUrl,
                label: "Connect Spotify",
              },
            });
          });
        });
      });

      this.webPlayer.connect();

      // setTimeout(() => {
      //   this.checkDeviceBug();
      // }, 1000);
    },
    onTime(percentage) {
      this.log("[Running] onTime");
      this.$store.commit("player/setPlayerPercentage", percentage);
    },
    onPlaying() {
      this.log("[Running] onPlaying");
      this.$store.commit("player/togglePlay", true);
    },
    onPause() {
      this.log("[Running] onPause");
      this.$store.commit("player/togglePlay", false);
    },
    async handleError(e, retry = () => {}) {
      if (e.statusCode === 401) {
        await this.refreshToken(this.spotifyRefreshToken);
        retry();
      } else {
        this.log("Spotify error", e);

        this.$store.commit("toast/addToast", {
          message: "There was an error with Spotify, refresh",
          action: {
            to: "#",
            label: "Refresh",
            callback() {
              window.location.reload();
            },
          },
        });
      }
    },
    async getDeviceId() {
      this.log("[Running] getDeviceId");

      try {
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

            if (!devices.length) {
              return null;
            }
            return devices[0].id;
          };

          this.deviceId = getActiveId();
        }

        return this.deviceId;
      } catch (e) {
        return this.handleError(e, () => this.getDeviceId());
      }
    },
    async getLocalPlayerState() {
      this.log("[Running] getLocalPlayerState");
      return this.webPlayer.getCurrentState();
    },
    async playSong(song, attempts = 0) {
      this.log("[Running] playSong");
      clearTimeout(this.fallbackTimer);
      if (!this.playlistUri && this.source !== "your-songs") {
        return;
      }

      if (this.needsUpdating) {
        this.$store.commit("queue/setNeedsUpdating", false);
      }

      const deviceId = await this.getDeviceId();

      if (!deviceId) {
        if (platform.os.family === "iOS" || platform.os.family === "Android") {
          console.log("set during playsong");
          this.$store.commit("setBugCatch", true);
          return;
        } else if (attempts < 3) {
          this.fallbackTimer = setTimeout(() => {
            this.playSong(song, attempts + 1);
          }, 2500);
          return;
        } else {
          this.$store.commit("toast/addToast", {
            message:
              "There was an error getting the spotify device, you may not be able to listen",
          });
          return;
        }
      }
      this.currentlyPlaying = song.spotify_id;

      const opts = {};

      if (this.playlistUri) {
        opts.context_uri = this.playlistUri;
      }
      if (this.source === "your-songs") {
        opts.uris = this.queueUris.map((uri) => `spotify:track:${uri}`);
      }

      try {
        await this.spotify.play({
          ...opts,
          device_id: deviceId,
          offset: {
            position: this.queueUris.findIndex(
              (uri) => song.spotify_id === uri
            ),
          },
        });
      } catch (e) {
        return this.handleError(e, () => this.playSong(song));
      }

      this.getCurrent();
    },
    async play() {
      this.log("[Running] play");

      try {
        await this.spotify.play();
      } catch (e) {
        return this.handleError(e, () => this.play());
      }
      this.getCurrent();
    },
    async pause() {
      this.log("[Running] pause");
      try {
        await this.spotify.pause();
      } catch (e) {
        return this.handleError(e, () => this.pause());
      }
    },
    async getCurrent() {
      // this.log("[SD][Running] getCurrent");

      clearTimeout(this.updateTimer);

      try {
        const { is_playing, item, progress_ms, context } =
          await this.spotify.getMyCurrentPlaybackState();

        // this.log("[SD] queue context", context, this.playlistUri);

        if (
          (!context || context.uri !== this.playlistUri) &&
          !this.needsUpdating
        ) {
          let reset = true;

          if (context && context.uri) {
            const activeSource = this.getActivePlaylist(context.uri);
            this.log("active source", activeSource, `/${activeSource}.json`);

            if (activeSource) {
              this.log("should be doing this?");
              const items = await this.$http.$get(`/${activeSource}.json`);
              this.log("new queue", {
                source: activeSource,
                items,
                position: items.findIndex(
                  (newItem) => newItem.spotify_id === item.id
                ),
              });
              this.$store.commit("queue/createQueue", {
                source: activeSource,
                items,
                position: items.findIndex(
                  (newItem) => newItem.spotify_id === item.id
                ),
              });
              reset = false;
            }
          }

          if (reset) {
            this.$store.commit("queue/resetQueue");
          }
        }

        if (!item) {
          return;
        }

        this.currentlyPlaying = item.id;

        if (this.queue.length) {
          const playingIndex = this.queue.findIndex(
            (row) => row.spotify_id === item.id
          );
          this.$store.commit("queue/setQueuePosition", playingIndex);
        }

        this.$store.commit("player/setSongDetails", {
          id: this.songs.find((row) => row.spotify_id === item.id)?.id || -1,
          title: item.name,
          artists: item.artists.map((a) => a.name),
          spotify_id: item.id,
        });

        this.$store.commit("player/forcePlayState", is_playing);
        this.$store.commit(
          "player/setPlayerPercentage",
          progress_ms / item.duration_ms
        );

        if (is_playing) {
          this.updateTimer = setTimeout(() => this.getCurrent(), 2000);
        }
      } catch (e) {
        this.log("Get current error", e);
        return this.handleError(e, () => this.getCurrent());
      }
    },
    getActivePlaylist(uri) {
      return Object.keys(this.playlists).find(
        (key) => this.playlists[key] === uri
      );
    },
    log(...args) {
      if (this.debug) {
        console.log(`[SD]`, ...args);
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
    spotifyRefreshToken() {
      return this.$store.state.spotify.refresh;
    },
    source() {
      return this.$store.state.queue.source;
    },
    playlistUri() {
      this.log("[Computed] playlistUri", this.source);
      return this.playlists[this.source] || false;
    },
    needsUpdating() {
      return this.$store.state.queue.needsUpdating;
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
      this.log("[WATCH] shouldPlay", val, val !== this.playing);
      if (val === this.playing || !this.currentlyPlaying) {
        return;
      }
      if (val) {
        this.play();
      } else {
        this.pause();
      }
    },

    position(val) {
      this.log("[WATCH] position", val);
      if (
        typeof val !== "undefined" &&
        val >= 0 &&
        this.queue[val].spotify_id !== this.currentlyPlaying
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
