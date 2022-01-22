require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

// const targetUrl = "https://www.abc.net.au/triplej/hottest100/20/1-100";
const targetUrl = "https://www.abc.net.au/triplej/hottest100/21/1-100";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const songs = [];

  $('ul[data-component="CountdownList"] li').each(function (idx, el) {
    // if ($(this).find("._2SEhp").length) {
    songs.push({
      title: $(this).find("._12YfA").text(),
      artist: $(this).find("._1nght div:last-child").text(),
      position: parseInt($(this).find("._9tt3M").text().replace(/\D/g, "")),
    });
    // } else if ($(this).find("._25a3Q").length) {
    //   songs.push({
    //     title: $(this).find("._12YfA").text(),
    //     artist: $(this).find("._2fDya").text(),
    //     position: parseInt($(this).find("._25a3Q").text()),
    //   });
    // }
  });

  await runUploadServer(songs.reverse(), SOURCE.TRIPLE_J, 2021);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
