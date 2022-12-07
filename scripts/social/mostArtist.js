require("../bootstrap");
const { makeAnimation, blinkText } = require("../createSocial");
const path = require("path");
const { getSongs } = require("../db");
const { initialiseSpotify, getArtistByName } = require("../spotify");
const { exec } = require("child_process");
const { COLORS } = require("../constants");

const YEAR = 2022;

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

const mapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

initialiseSpotify(true).then(async () => {
  const songs = await getSongs();
  const filtered = songs
    .map((song) => ({
      ...song,
      positions: song.positions.filter((source) => source.year === YEAR),
    }))
    .filter((song) => song.positions.length > 0);

  const reduced = Object.entries(
    filtered.reduce((prev, curr) => {
      curr.artists.forEach((artist) => {
        if (!prev[artist]) {
          prev[artist] = {
            count: 0,
            songs: [],
          };
        }

        const { positions, ...rest } = curr;

        prev[artist].count++;
        prev[artist].songs.push(rest);
      });

      return prev;
    }, {})
  );

  reduced.sort((a, b) => {
    return b[1].count - a[1].count;
  });

  const artist = await getArtistByName(reduced[0][0]);
  const artistSongs = reduced[0][1].songs;

  const video = await makeAnimation(
    [
      {
        type: "text",
        time: 2,
        data: {
          text: `Most songs\nby artist\n${YEAR}`,
        },
      },
      ...new Array(8).fill(0).map((v, idx, arr) => {
        return {
          type: "image",
          time: idx === arr.length - 1 ? 1 : 0.2,
          data: {
            image: artist.images[0].url,
            scale: 0.2 + (0.5 / arr.length) * idx,
          },
        };
      }),
      ...blinkText(artist.name, {
        scale:
          0.05 + clamp(mapRange(artist.name.length, 5, 25, 0.15, 0), 0, 0.15),
      }),
      {
        type: "text",
        time: 1,
        data: {
          text: `With`,
          scale: 0.04,
        },
      },
      ...artistSongs.map((song) => ({
        type: "text",
        time: 0.5,
        data: {
          text: `${song.title}`,
          scale: 0.08,
        },
      })),
    ],
    COLORS[2]
  );

  exec(`open ${video}`);

  process.exit();
});
