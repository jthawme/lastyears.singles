require("../bootstrap");
const { makeAnimation, ordinalSuffix } = require("../createSocial");
const open = require("open");
const path = require("path");
const { getSongs } = require("../db");
const { NAMES } = require("../constants");
const { initialiseSpotify, getArtistByName, getTrack } = require("../spotify");
const { exec } = require("child_process");

const publicImage = (file) => path.join(__dirname, "../public/images/", file);

const YEAR = 2020;

initialiseSpotify(true).then(async () => {
  const songs = await getSongs();
  const filtered = songs.map((song) => ({
    ...song,
    positions: song.positions.filter((source) => source.year === YEAR),
  }));

  filtered.sort((a, b) => {
    return b.positions.length - a.positions.length;
  });

  const topTrack = filtered[0];
  const track = await getTrack(topTrack.spotify_id);

  const video = await makeAnimation([
    {
      type: "text",
      time: 2,
      data: {
        text: `Most listed song\n${YEAR}`,
      },
    },
    ...new Array(8).fill(0).map((v, idx, arr) => {
      return {
        type: "image",
        time: idx === arr.length - 1 ? 1 : 0.2,
        data: {
          image: track.album.images[0].url,
          scale: 0.2 + (0.5 / arr.length) * idx,
        },
      };
    }),
    {
      type: "text",
      time: 2.5,
      data: {
        text: `${topTrack.title}\n\n${topTrack.artists.join("\n")}`,
        scale: 0.08,
      },
    },
    ...topTrack.positions.map((position) => ({
      type: "text",
      time: 0.5,
      data: {
        text: `${NAMES[position.source]}\n${ordinalSuffix(position.position)}`,
        scale: 0.08,
      },
    })),
  ]);

  // const video = await makeAnimation([
  //   {
  //     type: "text",
  //     time: 1,
  //     data: {
  //       text: "This is a test",
  //     },
  //   },
  //   {
  //     type: "image",
  //     time: 0.2,
  //     data: {
  //       image: publicImage("bg.png"),
  //       scale: 0.5,
  //     },
  //   },
  //   {
  //     type: "image",
  //     time: 0.2,
  //     data: {
  //       image: publicImage("bg.png"),
  //       scale: 0.6,
  //     },
  //   },
  //   {
  //     type: "image",
  //     time: 0.2,
  //     data: {
  //       image: publicImage("bg.png"),
  //       scale: 0.7,
  //     },
  //   },
  //   {
  //     type: "image",
  //     time: 0.2,
  //     data: {
  //       image: publicImage("bg.png"),
  //       scale: 0.8,
  //     },
  //   },
  //   {
  //     type: "text",
  //     time: 1,
  //     data: {
  //       text: "Is IT?",
  //     },
  //   },
  //   {
  //     type: "text",
  //     time: 1,
  //     data: {
  //       text: "Yes",
  //     },
  //   },
  //   {
  //     type: "text",
  //     time: 1,
  //     data: {
  //       text: "COOL",
  //     },
  //   },
  // ]);

  exec(`open ${video}`);

  process.exit();
});
