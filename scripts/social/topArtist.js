require("../bootstrap");
const { makeAnimation, blinkText } = require("../createSocial");
const path = require("path");
const { getSongs } = require("../db");
const { initialiseSpotify, getArtistByName } = require("../spotify");
const { exec } = require("child_process");
const { COLORS } = require("../constants");

const publicImage = (file) => path.join(__dirname, "../public/images/", file);

const YEAR = 2020;

initialiseSpotify(true).then(async () => {
  const songs = await getSongs();
  const filtered = songs.map((song) => ({
    ...song,
    positions: song.positions.filter((source) => source.year === YEAR),
  }));

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

        prev[artist].count += positions.length;
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
          text: `Most listed\nartist\n${YEAR}`,
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
      ...blinkText(artist.name, { scale: 0.08 }),
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
    COLORS[1]
  );

  exec(`open ${video}`);

  process.exit();
});
