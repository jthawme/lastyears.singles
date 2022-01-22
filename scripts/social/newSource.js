require("../bootstrap");
const { makeAnimation, ordinalSuffix, blinkText } = require("../createSocial");
const open = require("open");
const path = require("path");
const { exec } = require("child_process");
const { getSongs } = require("../db");
const { NAMES, SOURCE, COLORS } = require("../constants");
const { initialiseSpotify, getArtistByName, getTracks } = require("../spotify");

const publicImage = (file) => path.join(__dirname, "../public/images/", file);

const YEAR = 2021;

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

initialiseSpotify(true).then(async () => {
  const songs = await getSongs();
  const filtered = shuffle(
    songs
      .map((song) => ({
        ...song,
        positions: song.positions.filter((source) => source.year === YEAR),
      }))
      .filter((song) =>
        song.positions.find((source) => source.source === SOURCE.TRIPLE_J)
      )
  ).slice(0, 20);

  const { tracks } = await getTracks(filtered.map((song) => song.spotify_id));

  const video = await makeAnimation(
    [
      {
        type: "text",
        time: 2,
        data: {
          text: `New list:\n${NAMES[SOURCE.TRIPLE_J]}`,
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
      {
        type: "text",
        time: 1,
        data: {
          text: `Listen to it all`,
          scale: 0.1,
        },
      },
      ...blinkText(`FOR FREE`, { scale: 0.3 }),
    ],
    COLORS[2]
  );

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
