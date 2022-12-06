require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrl =
  "https://crackmagazine.net/article/list-article/best-songs-2022/";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const songs = [];
  $(".wjh__blocks .wjh__block").each(function (idx, el) {
    const src = $(this).find("iframe").attr("src");

    songs.push({
      title: $(this).find(".wjh__details h3").text().trim(),
      artist: $(this).find(".wjh__details h2").text().trim(),
      position: $(this).find(".wjh__number").text().trim(),
      spotifyTrack: src.includes("spotify") ? src : undefined,
    });
  });

  await runUploadServer(songs, SOURCE.CRACK, 2022);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
