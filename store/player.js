export const state = () => {
  return {
    percentage: 0,
    shouldPlay: false,
    playing: false,
    displayVisual: true,
    spotifyAuthoriseUrl: null,
    canUseSpotify: true,
  };
};

export const mutations = {
  setPlayerPercentage(state, percentage) {
    state.percentage = percentage;
  },
  toggleDisplayVisual(state, displayVisual) {
    state.displayVisual = displayVisual;
  },
  setSpotifyAuthoriseUrl(state, url) {
    state.spotifyAuthoriseUrl = url;
  },
  toggleShouldPlay(state, val) {
    state.shouldPlay = val;
  },
  togglePlay(state, val) {
    state.playing = val;
  },
};
