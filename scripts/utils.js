module.exports.getServerParam = (key, defaultValue) => {
  const options = process.argv.slice(2).reduce((p, v, idx, arr) => {
    if (v.startsWith("--")) {
      return {
        ...p,
        [v.slice(2)]: arr[idx + 1],
      };
    }

    return p;
  }, {});

  return options[key] || defaultValue;
};

module.exports.promiseRunner = (arr, cb) => {
  return new Promise((resolve) => {
    const run = async (idx = 0) => {
      if (idx >= arr.length) {
        resolve();
        return;
      }

      await cb(arr[idx], idx);
      run(idx + 1);
    };

    run();
  });
};
