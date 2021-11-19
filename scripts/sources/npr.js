require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrls = [
  "https://www.npr.org/2020/12/03/931771524/the-100-best-songs-of-2020-page-1",
  "https://www.npr.org/2020/12/03/934634561/the-100-best-songs-of-2020-page-2",
  "https://www.npr.org/2020/12/03/934634607/the-100-best-songs-of-2020-page-3",
  "https://www.npr.org/2020/12/03/934634855/the-100-best-songs-of-2020-page-4",
  "https://www.npr.org/2020/12/03/934634998/the-100-best-songs-of-2020-page-5",
];

const run = async () => {
  const getPage = async (idx = 0) => {
    const code = await fetch(targetUrls[idx], {
      headers: {
        cookie: `trackingChoice=true; choiceVersion=1; dateOfChoice=${Date.now()};`,
      },
    }).then((resp) => resp.text());
    const $ = cheerio.load(code);

    const songs = [];
    $("#storytext .hr").each(function (idx, el) {
      if ($(this).next().hasClass("video")) {
        const position = parseInt($(this).nextAll("h6:first").text());
        const artist = $(this).nextAll("h3").eq(0).text();
        const title = $(this).nextAll("h3").eq(1).text();
        const youtube = $(this)
          .next(".video")
          .find("iframe")
          .attr("src")
          .split("embed/")
          .pop()
          .split("?")
          .shift();

        songs.push({
          position,
          artist,
          title: title.substring(1, title.length - 1),
          youtubeLink: `https://www.youtube.com/watch?v=${youtube}`,
        });
      }
    });
    return songs;
  };

  const data = await Promise.all(targetUrls.map((url, idx) => getPage(idx)));

  await runUploadServer(data.flat(), SOURCE.NPR, 2020);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
