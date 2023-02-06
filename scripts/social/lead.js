require("../bootstrap");
const { makeAnimation, blinkText } = require("../createSocial");
const path = require("path");
const { getSongs, getRandomSong } = require("../db");
const { initialiseSpotify, getArtistByName, getTracks } = require("../spotify");
const { exec } = require("child_process");
const { COLORS, SOURCE, NAMES } = require("../constants");

const YEAR = 2022;

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

const mapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

initialiseSpotify(true).then(async () => {
  const songs = await getRandomSong(YEAR, 15);

  const { tracks } = await getTracks(songs.map((song) => song.spotify_id));

  const frames = [
    {
      type: "text",
      time: 1.5,
      data: {
        text: `Listen to the last year's greatest songs`,
      },
    },
    ...tracks.map((track) => {
      return {
        type: "image",
        time: 0.1,
        data: {
          image: track.album.images[0].url,
          scale: 0.75,
        },
      };
    }),
    {
      type: "text",
      time: 1.5,
      data: {
        text: "From the greatest music publications on the internet",
        scale: 0.08,
        maxWidth: 0.75,
      },
    },
    ...Object.values(NAMES)
      .filter((name) => name !== NAMES[SOURCE.BIG_J_THE_WIZARD_KING])
      .map((name) => ({
        type: "text",
        time: 0.2,
        data: {
          text: name,
        },
      })),
  ];

  const video1 = await makeAnimation(frames, COLORS[4], "WIDE", "output1.mp4");
  const video2 = await makeAnimation(
    frames,
    COLORS[3],
    "SQUARE",
    "output2.mp4"
  );

  exec(`open ${video1}`);
  exec(`open ${video2}`);

  process.exit();
});
