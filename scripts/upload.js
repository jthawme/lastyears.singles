const inquirer = require("inquirer");
const { saveSong, saveSearched, getSearched, getSongs } = require("./db");
const Bundler = require("parcel-bundler");
const express = require("express");
const path = require("path");
const open = require("open");

const youtubeRegex =
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
const spotifyRegex =
  /(https?:\/\/open.spotify.com\/(track|user|artist|album)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/;

const runUploadServer = (items, source, year) => {
  return new Promise((resolve) => {
    let server = null;
    let itemIdx = 0;
    const app = express();

    const file = path.join(__dirname, "public", "index.html"); // Pass an absolute path to the entrypoint here
    const options = {}; // See options section of api docs, for the possibilities

    // Initialize a new bundler using a file and options
    const bundler = new Bundler(file, options);

    app.use(express.json());

    app.get("/api/all", async (req, res) => {
      const songs = await getSongs();

      return res.json({ songs });
    });

    app.get("/api/next", async (req, res) => {
      const getNext = async () => {
        if (itemIdx >= items.length) {
          return false;
        } else {
          const { youtubeLink, title, artist, position } = items[itemIdx];

          const prev = await getSearched(title, artist, source);

          if (prev) {
            itemIdx++;
            return getNext();
          }

          return items[itemIdx];
        }
      };

      const next = await getNext();

      if (!next) {
        res.json({
          done: true,
        });
        server.close();
        resolve();
        return;
      }

      res.json({
        item: next,
      });
    });

    app.post("/api/submit", async (req, res) => {
      try {
        const {
          songId,
          spotifyTrack,
          youtubeLink,
          title,
          artist,
          position,
          skip,
        } = req.body;

        let id = songId;

        if (skip) {
          itemIdx++;
          return res.json({ success: true });
        }

        if ((!spotifyTrack || !youtubeLink) && !songId) {
          throw new Error("Need spotify and yutube");
        }

        if (!songId) {
          const spotifyId = spotifyTrack.split("track/").pop();

          const songRow = await saveSong(spotifyId, youtubeLink);
          id = songRow.id;
        }
        await saveSearched(id, title, artist, source, position, year);

        itemIdx++;
        return res.json({ success: true });
      } catch (e) {
        console.log("submit error", e);
        return res.json({ success: false });
      }
    });

    // Let express use the bundler middleware, this will let Parcel handle every request over your express server
    app.use(bundler.middleware());

    // Listen on port 8080
    server = app.listen(8080, () => {
      open("http://localhost:8080");
      console.log(`Open: http://localhost:8080`);
    });
  });
};

const runUpload = (items, source, year) => {
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
      await saveSearched(songRow.id, title, artist, source, position, year);

      next(idx + 1);
    };

    next();
  });
};

module.exports = { runUpload, runUploadServer };
