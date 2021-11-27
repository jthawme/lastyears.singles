export const state = () => {
  return {
    position: -1,
    source: null,
    items: [],
    needsUpdating: false,
  };
};

export const mutations = {
  resetQueue(state) {
    state.position = -1;
    state.source = null;
    state.items = [];
  },
  createQueue(state, { items, source, position, needsUpdating }) {
    if (state.source !== source) {
      state.items = items.slice();
      state.source = source;
    }

    state.position = position;

    if (needsUpdating) {
      state.needsUpdating = needsUpdating;
    }
  },
  setNeedsUpdating(state, val) {
    state.needsUpdating = val;
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
