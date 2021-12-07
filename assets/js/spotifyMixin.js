import { nanoid } from "nanoid";
import queryString from "query-string";
import { PLAYER_CONTROL } from "~/store/player";
import { ACCESS_TOKEN_KEY, STATE_KEY } from "./constants";
import { getItem, setItem } from "./localStorage";
import { getSpotifyAuthoriseUrl } from "./spotify";
import { SpotifyTokenMixin } from "./spotifyTokenMixin";

export const SpotifyMixin = {
  mixins: [SpotifyTokenMixin],
  async mounted() {
    requestAnimationFrame(async () => {
      let loggedIn = await this.getCurrentToken();

      if (!loggedIn) {
        loggedIn = await this.getPreviousToken();
      }

      if (!loggedIn) {
        this.setupAuthorise();
      }
    });
  },
  data() {
    return {
      spotifyToken: null,
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
      } else {
        this.$store.commit("toast/addToast", {
          message: "Unfortunately only Spotify Premium accounts work :(",
        });
      }
    },

    /**
     * Grabs any previous token and tries to initiate it
     *
     * @returns {Promise<boolean>}
     */
    async getPreviousToken() {
      const prevToken = getItem(ACCESS_TOKEN_KEY);

      if (prevToken) {
        const [expires, token, refresh] = prevToken.split(":");

        if (
          !isNaN(parseInt(expires)) &&
          Date.now() < parseInt(expires) &&
          token
        ) {
          this.setToken(token, refresh, parseInt(expires));
          return Promise.resolve(true);
        } else if (token && refresh) {
          this.refreshToken(refresh);
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
    async getCurrentToken() {
      if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const state = params.get("state");
        const code = params.get("code");

        window.history.replaceState(
          {},
          null,
          `${window.location.origin}${window.location.pathname}`
        );

        const prevStateToken = getItem(STATE_KEY);

        if (code && state === prevStateToken) {
          await this.exchangeToken(code);

          this.$store.commit("toast/addToast", {
            message: "Successfully connected to spotify, happy listening!",
          });

          plausible("Spotify Connect", { props: { status: "completed" } });

          return Promise.resolve(true);
        }
      }

      return Promise.resolve(false);
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
