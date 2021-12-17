require("../bootstrap");
const { makeAnimation, blinkText } = require("../createSocial");
const path = require("path");
const { getSongs, getRandomSong } = require("../db");
const { initialiseSpotify, getArtistByName, getTracks } = require("../spotify");
const { exec } = require("child_process");
const { COLORS, SOURCE, NAMES } = require("../constants");

const YEAR = 2021;

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

const mapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

initialiseSpotify(true).then(async () => {
  const songs1 = await getRandomSong(YEAR, 8, {
    "searched.source": SOURCE.THE_FADER,
  });
  const songs2 = await getRandomSong(YEAR, 8, {
    "searched.source": SOURCE.COMPLEX,
  });

  const { tracks } = await getTracks(
    [...songs1, ...songs2].map((song) => song.spotify_id)
  );

  const frames = [
    {
      type: "text",
      time: 1,
      data: {
        text: `Just added`,
        scale: 0.2,
      },
    },
    {
      type: "text",
      time: 1,
      data: {
        text: NAMES[SOURCE.THE_FADER],
        scale: 0.2,
      },
    },
    {
      type: "text",
      time: 1,
      data: {
        text: NAMES[SOURCE.COMPLEX],
        scale: 0.2,
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
  ];

  // const video1 = await makeAnimation(frames, COLORS[4], "WIDE", "output1.mp4");
  const video2 = await makeAnimation(
    frames,
    COLORS[3],
    "SQUARE",
    "output2.mp4"
  );

  // exec(`open ${video1}`);
  exec(`open ${video2}`);

  process.exit();
});
