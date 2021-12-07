require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

// const targetUrl =
//   "https://www.nme.com/features/nme-best-songs-of-the-year-2020-2833773";
const targetUrl =
  "https://www.nme.com/features/music-features/nme-best-songs-of-the-year-2021-3112636";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const songs = [];
  $("article h2").each(function (idx, el) {
    const text = $(this).text().trim();

    const [position, ...rest] = text.split(".");
    const afterText = rest.join(".");
    const [artist, title] = afterText.split(" – ");

    songs.push({
      title: title.trim(),
      artist: artist.trim(),
      position: position.trim(),
    });
  });

  await runUploadServer(songs, SOURCE.NME, 2021);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
