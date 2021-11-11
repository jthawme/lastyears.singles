export const PLAYER_CONTROL = {
  SPOTIFY: "spotify",
  YOUTUBE: "youtube",
};

export const state = () => {
  return {
    playerControl: PLAYER_CONTROL.YOUTUBE,
    percentage: 0,
    shouldPlay: false,
    playing: false,
    song: null,
  };
};

export const mutations = {
  setPlayerControl(state, control) {
    state.playerControl = control;
  },
  setPlayerPercentage(state, percentage) {
    state.percentage = percentage;
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
  setSongDetails(state, val) {
    state.song = val;
  },
};
