export const state = () => {
  return {
    token: null,
    refresh: null,
    spotifyAuthoriseUrl: null,
    canUseSpotify: false,
    object: null,
  };
};

export const mutations = {
  setSpotifyToken(state, token) {
    state.token = token;
  },
  setRefreshToken(state, refresh) {
    state.refresh = refresh;
  },
  setSpotifyAuthoriseUrl(state, url) {
    state.spotifyAuthoriseUrl = url;
  },
  setCanUseSpotify(state, val) {
    state.canUseSpotify = val;
  },
  setObject(state, val) {
    state.object = val;
  },
};
