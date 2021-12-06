import { getRedirectURI, getSpotify } from "./spotify";

export const SpotifyTokenMixin = {
  methods: {
    async exchangeToken(code) {
      const { access_token, refresh_token, expires_in } =
        await this.$http.$post("/api/token", {
          code,
          redirect_uri: getRedirectURI(),
        });

      this.setToken(
        access_token.toString(),
        refresh_token.toString(),
        Date.now() + parseFloat(expires_in.toString()) * 1000
      );
    },

    /**
     * Initiates the spotify object and attaches it to vuex
     *
     * @param {string} token
     * @param {number} expires
     */
    setToken(token, refresh, expires) {
      this.$store.commit("spotify/setSpotifyToken", token);
      this.$store.commit("spotify/setRefreshToken", refresh);
      this.$store.commit(
        "spotify/setObject",
        getSpotify(token, expires, refresh)
      );
    },

    async refreshToken(refresh) {
      const { access_token, expires_in } = await this.$http.$post(
        "/api/refresh",
        {
          refresh,
        }
      );

      this.setToken(access_token, refresh, expires_in);
      return access_token;
    },
  },
};
