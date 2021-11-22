require("./bootstrap");
const { getSongs, updateSongPreview } = require("./db");

getSongs()
  .then((songs) => {
    return new Promise((resolve) => {
      const run = async (idx = 0) => {
        if (idx >= songs.length) {
          resolve();
          return;
        }

        await updateSongPreview(songs[idx].id);
        run(idx + 1);
      };

      run();
    });
  })
  .then(() => {
    console.log("done");
    process.exit();
  });
