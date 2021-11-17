import { Breakpoint } from "~/assets/js/mixins/breakpoints";
import { NAMES } from "~/scripts/constants";
import allSongs from "~/static/all.json";
import allPlaylists from "~/static/playlists.json";

export const state = () => {
  return {
    idle: false,
    displayVisual: true,
    lists: [],
    playlists: {},
    breakpoint: {
      [Breakpoint.Desktop]: true,
      [Breakpoint.LargeMobile]: true,
      [Breakpoint.Tablet]: true,
      [Breakpoint.Mobile]: true,
    },
  };
};

export const mutations = {
  setIdle(state, val) {
    state.idle = val;
  },
  setBreakpoint(state, val) {
    state.breakpoint[val.key] = val.value;
  },
  setList(state, val) {
    state.lists = val;
  },
  toggleDisplayVisual(state, displayVisual) {
    state.displayVisual = displayVisual;
  },
  setPlaylists(state, playlists) {
    state.playlists = { ...playlists };
  },
};

export const actions = {
  async nuxtServerInit({ commit }, { env }) {
    const sources = [
      ...new Set(
        allSongs.flatMap((item) => item.positions.map((p) => p.source))
      ),
    ];

    commit(
      "setList",
      sources.map((s) => ({
        name: NAMES[s],
        slug: s,
      }))
    );

    commit("setPlaylists", allPlaylists);
  },
};
