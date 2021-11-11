export const state = () => {
  return {
    position: -1,
    source: null,
    items: [],
  };
};

export const mutations = {
  resetQueue(state) {
    state.position = -1;
    state.source = null;
    state.items = [];
  },
  createQueue(state, { items, source, position }) {
    if (state.source !== source) {
      state.items = items.slice();
      state.source = source;
    }

    state.position = position;
  },
  setQueuePosition(state, position) {
    state.position = position;
  },
  nextSong(state) {
    if (state.position < state.items.length - 1) {
      state.position = state.position + 1;
    }
  },
  prevSong(state) {
    if (state.position > 0) {
      state.position = state.position - 1;
    }
  },
};
