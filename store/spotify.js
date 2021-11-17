export const state = () => {
  return {
    token: null,
    spotifyAuthoriseUrl: null,
    canUseSpotify: false,
    object: null,
  };
};

export const mutations = {
  setSpotifyToken(state, token) {
    state.token = token;
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
