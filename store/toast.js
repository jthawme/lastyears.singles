import { nanoid } from "nanoid";

export const TOAST_TYPE = {
  GENERAL: "general",
  ERROR: "error",
};

export const state = () => {
  return {
    items: [],
  };
};

export const mutations = {
  addToast(state, { message, type = TOAST_TYPE.GENERAL, action, duration }) {
    state.items = [
      ...state.items,
      {
        id: nanoid(),
        message,
        type,
        action,
        duration,
      },
    ];
  },
  removeToast(state, id) {
    state.items.splice(
      state.items.findIndex((item) => item.id === id),
      1
    );
  },
};
