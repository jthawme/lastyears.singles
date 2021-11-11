export const state = () => {
  return {
    spotifyAuthoriseUrl: null,
    canUseSpotify: false,
    object: null,
  };
};

export const mutations = {
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
