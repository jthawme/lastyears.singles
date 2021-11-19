require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrl = "https://www.abc.net.au/triplej/hottest100/20/1-100";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const songs = [];

  $('ul[data-component="CountdownList"] li').each(function (idx, el) {
    if ($(this).find("._2SEhp").length) {
      songs.push({
        title: $(this).find("._2t2Fn").text(),
        artist: $(this).find("._3uUrH").text(),
        position: parseInt($(this).find("._2SEhp").text().replace(/\D/g, "")),
      });
    } else if ($(this).find("._25a3Q").length) {
      songs.push({
        title: $(this).find("._12YfA").text(),
        artist: $(this).find("._2fDya").text(),
        position: parseInt($(this).find("._25a3Q").text()),
      });
    }
  });

  await runUploadServer(songs.reverse(), SOURCE.TRIPLE_J, 2020);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
