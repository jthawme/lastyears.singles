require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

// const targetUrl =
//   "https://pitchfork.com/features/lists-and-guides/best-songs-2020/";
const targetUrl =
  "https://pitchfork.com/features/lists-and-guides/best-songs-2021/";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const hrs = $(".body__inner-container hr");

  const songs = [];
  $(hrs).each(function (idx, el) {
    const position =
      parseInt($(this).nextAll(".heading-h3:first").text()) || 100 - idx;

    const full = $(this).nextAll("h2:first").text();
    const [artist, title] = full.split(":");

    const tests = $(this).nextAll().slice(0, 10);

    const listen = $(tests).filter(function (i, el) {
      return (
        $(this).has($(this).find("a[href^='https://www.youtube.']")).length &&
        $(this).find("strong").text() === "Listen:"
      );
    });

    const youtubeLink = $(listen)
      .find("a[href^='https://www.youtube.']")
      .attr("href");

    songs.push({
      position,
      artist,
      title,
      youtubeLink,
    });
  });

  runUploadServer(songs, SOURCE.PITCHFORK, 2021);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
