const PREFIX = `lastyearssingles`;

export const setItem = (key, val) => {
  localStorage.setItem(`${PREFIX}-${key}`, val);
};

export const getItem = (key) => {
  return localStorage.getItem(`${PREFIX}-${key}`);
};
