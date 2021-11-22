import { nanoid } from "nanoid";
import queryString from "query-string";
import { PLAYER_CONTROL } from "~/store/player";
import { ACCESS_TOKEN_KEY, STATE_KEY } from "./constants";
import { getItem, setItem } from "./localStorage";
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
    /**
     * Method that grabs anything after spotify is successful
     */
    async setupSpotify() {
      const profile = await this.spotify.getMe();

      if (profile.product === "premium") {
        this.$store.commit("player/setPlayerControl", PLAYER_CONTROL.SPOTIFY);
      }
    },

    /**
     * Grabs any previous token and tries to initiate it
     *
     * @returns {Promise<boolean>}
     */
    getPreviousToken() {
      const prevToken = getItem(ACCESS_TOKEN_KEY);

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

    /**
     * Checks to see if this is a callback state and grabs the info from the page
     *
     * @returns {Promise<boolean>}
     */
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

        const prevStateToken = getItem(STATE_KEY);

        if (state && access_token && expires_in && state === prevStateToken) {
          plausible("Spotify Connect", { props: { status: "completed" } });

          this.$store.commit("toast/addToast", {
            message: "Successfully connected to spotify, happy listening!",
          });

          this.setToken(
            access_token.toString(),
            Date.now() + parseFloat(expires_in.toString()) * 1000
          );

          return Promise.resolve(true);
        }
      }

      return Promise.resolve(false);
    },

    /**
     * Initiates the spotify object and attaches it to vuex
     *
     * @param {string} token
     * @param {number} expires
     */
    setToken(token, expires) {
      this.$store.commit("spotify/setSpotifyToken", token);
      this.$store.commit("spotify/setObject", getSpotify(token, expires));
    },

    /**
     * If not logged in setup the scene to allow for the authorisation URL
     */
    setupAuthorise() {
      setItem(STATE_KEY, this.stateToken);
      this.$store.commit(
        "spotify/setSpotifyAuthoriseUrl",
        getSpotifyAuthoriseUrl(this.stateToken)
      );
    },
  },
  computed: {
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
