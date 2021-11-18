require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

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

  await runUploadServer(songs.reverse(), SOURCE.BILLBOARD);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
