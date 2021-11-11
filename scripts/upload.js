const inquirer = require("inquirer");
const { saveSong, saveSearched, getSearched } = require("./db");

const youtubeRegex =
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
const spotifyRegex =
  /(https?:\/\/open.spotify.com\/(track|user|artist|album)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/;

const getPrompt = (schema) => {
  return new Promise((resolve) => {
    prompt.get(schema, (err, result) => {
      resolve(result);
    });
  });
};

const runUpload = (items, source) => {
  return new Promise((resolve) => {
    let rows = [];

    const next = async (idx = 0) => {
      if (idx > items.length) {
        resolve();
        return;
      }

      const { youtubeLink, title, artist, position } = items[idx];

      const prev = await getSearched(title, artist, source);

      if (prev) {
        next(idx + 1);
        return;
      }

      const schema = [
        {
          type: "input",
          name: "spotifyTrack",
          message: `Spotify link for ${artist} - ${title}`,
          validate(value) {
            const pass = value.match(spotifyRegex);
            if (pass) {
              return true;
            }

            return "Must be a full spotify track link";
          },
        },
        {
          type: "input",
          name: "youtubeLink",
          message: `Youtube link for ${artist} - ${title}`,
          default: youtubeLink,
          validate(value) {
            const pass = value.match(youtubeRegex);
            if (pass) {
              return true;
            }

            return "Must be a full youtube link";
          },
        },
      ];

      // const answers = await getPrompt(schema, prompt);
      const answers = await inquirer.prompt(schema);
      const spotifyId = answers.spotifyTrack.split("track/").pop();

      const songRow = await saveSong(spotifyId, answers.youtubeLink);
      await saveSearched(songRow.id, title, artist, source, position);

      next(idx + 1);
    };

    next();
  });
};

module.exports = { runUpload };
