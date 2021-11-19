require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrl =
  "https://www.thefader.com/2020/12/17/100-best-songs-2020-list-haim-bad-bunny-bladee-rank";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const songs = [];
  $(".content_blocks h5").each(function (idx, el) {
    const text = $(this).text().trim();

    const [position, ...rest] = text.split(".");
    const afterText = rest.join(".");
    const [artist, ...title] = afterText.split(", ");

    songs.push({
      title: title.join(", ").trim(),
      artist: artist.trim(),
      position: position.trim(),
    });
  });

  await runUploadServer(songs, SOURCE.THE_FADER, 2020);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
