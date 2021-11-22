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
  addToast(
    state,
    { message, type = TOAST_TYPE.GENERAL, action, duration, callback }
  ) {
    const id = nanoid();
    state.items = [
      ...state.items,
      {
        id,
        message,
        type,
        action,
        duration,
      },
    ];

    if (callback) {
      callback(id);
    }
  },
  removeToast(state, id) {
    state.items.splice(
      state.items.findIndex((item) => item.id === id),
      1
    );
  },
};
