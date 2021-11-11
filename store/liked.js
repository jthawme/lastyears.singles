export const state = () => {
  return {
    songs: [],
    items: [],
  };
};

export const mutations = {
  setSongs(state, items) {
    state.songs = items;
  },
  setLikedItems(state, items) {
    state.items = items.slice();
  },
  addLikedItem(state, item) {
    state.items = [...state.items, item];
  },
  removeLikedItem(state, item) {
    const items = state.items.slice();
    items.splice(items.indexOf(item), 1);
    state.items = items;
  },
};
