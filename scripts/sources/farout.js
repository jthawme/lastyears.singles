require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrl = "https://faroutmagazine.co.uk/the-50-best-songs-of-2022/";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const songs = [];
  $(".article-content h3").each(function (idx, el) {
    const text = $(this).text().trim();

    const title = text
      .match(/[‘“](.*)[’”]/gm)
      .shift()
      .replace(/[‘“’”]/g, "");
    const [position, ...rest] = text.split(".");
    const artist = text.split("– ").pop().split(", ").shift();

    // const afterText = rest.join(".");
    // const [artist, title] = afterText.split(" – ");

    songs.push({
      title: title.trim(),
      artist: artist.trim(),
      position: position.trim(),
    });
  });

  await runUploadServer(songs, SOURCE.FAR_OUT, 2022);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
