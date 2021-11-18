require("./bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("./upload");
const { SOURCE } = require("./constants");

const targetUrl = "https://www.billboard.com/charts/year-end/hot-100-songs/";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const songs = [];
  $(".chart-results-list .o-chart-results-list-row-container").each(function (
    idx,
    el
  ) {
    const title = $(this).find("#title-of-a-story").text();
    const artist = $(this).find("#title-of-a-story").next().text();
    const position = $(this).find(".o-chart-results-list__item").eq(0).text();

    songs.push({
      title: title.trim(),
      artist: artist.trim(),
      position: position.trim(),
    });
  });

  // const hrs = $(".body__inner-container hr");

  // const songs = [];
  // $(hrs).each(function (idx, el) {
  //   const position =
  //     parseInt($(this).nextAll(".heading-h3:first").text()) || 100 - idx;

  //   const full = $(this).nextAll("h2:first").text();
  //   const [artist, title] = full.split(":");

  //   const tests = $(this).nextAll().slice(0, 10);

  //   const listen = $(tests).filter(function (i, el) {
  //     return (
  //       $(this).has($(this).find("a[href^='https://www.youtube.']")).length &&
  //       $(this).find("strong").text() === "Listen:"
  //     );
  //   });

  //   const youtubeLink = $(listen)
  //     .find("a[href^='https://www.youtube.']")
  //     .attr("href");

  //   songs.push({
  //     position,
  //     artist,
  //     title,
  //     youtubeLink,
  //   });

  await runUploadServer(songs.reverse(), SOURCE.BILLBOARD);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
