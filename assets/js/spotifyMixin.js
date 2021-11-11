import { nanoid } from "nanoid";
import queryString from "query-string";
import { ACCESS_TOKEN_KEY, STATE_KEY } from "./constants";
import { getSpotify, getSpotifyAuthoriseUrl } from "./spotify";

export const SpotifyMixin = {
  async mounted() {
    let loggedIn = await this.getCurrentToken();

    if (!loggedIn) {
      loggedIn = await this.getPreviousToken();
    }

    if (!loggedIn) {
      this.setupAuthorise();
    }
  },
  data() {
    return {
      spotifyToken: null,
      stateToken: nanoid(),
    };
  },
  methods: {
    async setupSpotify() {
      const profile = await this.spotify.getMe();

      this.$store.commit(
        "spotify/setCanUseSpotify",
        profile.product === "premium"
      );
    },
    getPreviousToken() {
      const prevToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (prevToken) {
        const [expires, token] = prevToken.split(":");

        if (
          !isNaN(parseInt(expires)) &&
          Date.now() < parseInt(expires) &&
          token
        ) {
          this.setToken(token, parseInt(expires));
          return Promise.resolve(true);
        }
      }

      return Promise.resolve(false);
    },
    getCurrentToken() {
      if (window.location.hash) {
        const { state, access_token, expires_in } = queryString.parse(
          window.location.hash
        );

        window.history.replaceState(
          {},
          null,
          `${window.location.origin}${window.location.pathname}`
        );

        const prevStateToken = localStorage.getItem(STATE_KEY);

        if (state && access_token && expires_in && state === prevStateToken) {
          this.setToken(
            access_token.toString(),
            Date.now() + parseFloat(expires_in.toString()) * 1000
          );

          return Promise.resolve(true);
        }
      }

      return Promise.resolve(false);
    },
    setToken(token, expires) {
      this.$store.commit("spotify/setObject", getSpotify(token, expires));
    },
    setupAuthorise() {
      localStorage.setItem(STATE_KEY, this.stateToken);
      this.$store.commit(
        "spotify/setSpotifyAuthoriseUrl",
        getSpotifyAuthoriseUrl(this.stateToken)
      );
    },
  },
  computed: {
    queueSource() {
      return this.$store.state.queue.source;
    },
    queue() {
      return this.$store.state.queue.items;
    },
    queueUris() {
      return this.queue.map((item) => item.spotify_id);
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
    spotify: {
      immediate: true,
      handler(val, oldVal) {
        if (val && !oldVal) {
          this.setupSpotify();
        }
      },
    },
  },
};
