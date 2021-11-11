import { Breakpoint } from "~/assets/js/mixins/breakpoints";
import { NAMES } from "~/scripts/constants";
import data from "~/assets/data.json";

export const state = () => {
  return {
    idle: false,
    lists: [],
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
};

export const actions = {
  async nuxtServerInit({ commit }, { env }) {
    const sources = [
      ...new Set(data.flatMap((item) => item.positions.map((p) => p.source))),
    ];

    commit(
      "setList",
      sources.map((s) => ({
        name: NAMES[s],
        slug: s,
      }))
    );
  },
};
