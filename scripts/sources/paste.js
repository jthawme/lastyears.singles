require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrl =
  "https://www.pastemagazine.com/music/best-songs/best-songs-of-2022/";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const songs = [];
  $(".entry h2").each(function (idx, el) {
    // 50. Denzel Curry: “Walkin”
    const text = $(this).text().trim();

    songs.push({
      title: text.split(". ").pop().split(": “").pop().replace("”", ""),
      artist: text.split(". ").pop().split(": “").shift(),
      position: text.split(". ").shift(),
    });
  });

  await runUploadServer(songs, SOURCE.PASTE_MAGAZINE, 2022);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
