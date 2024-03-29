require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

// const targetUrls = [
//   "https://www.npr.org/2021/12/02/1054377950/the-100-best-songs-of-2021-page-1",
//   "https://www.npr.org/2021/12/02/1054378275/the-100-best-songs-of-2021-page-2",
//   "https://www.npr.org/2021/12/02/1054379062/the-100-best-songs-of-2021-page-3",
//   "https://www.npr.org/2021/12/02/1054379661/the-100-best-songs-of-2021-page-4",
//   "https://www.npr.org/2021/12/02/1054380365/the-100-best-songs-of-2021-page-5",
// ];
//2020
// const targetUrls = [
//   "https://www.npr.org/2020/12/03/931771524/the-100-best-songs-of-2020-page-1",
//   "https://www.npr.org/2020/12/03/934634561/the-100-best-songs-of-2020-page-2",
//   "https://www.npr.org/2020/12/03/934634607/the-100-best-songs-of-2020-page-3",
//   "https://www.npr.org/2020/12/03/934634855/the-100-best-songs-of-2020-page-4",
//   "https://www.npr.org/2020/12/03/934634998/the-100-best-songs-of-2020-page-5",
// ];

const targetUrls = [
  `https://www.npr.org/2022/12/15/1135802083/100-best-songs-2022-page-1`,
  `https://www.npr.org/2022/12/15/1135802978/100-best-songs-2022-page-2`,
  `https://www.npr.org/2022/12/15/1135803422/100-best-songs-2022-page-3`,
  `https://www.npr.org/2022/12/15/1135803900/100-best-songs-2022-page-4`,
  `https://www.npr.org/2022/12/15/1135804266/100-best-songs-2022-page-5`,
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
    $("#storytext .hr,#storytext .bucketwrap.statichtml").each(function (
      idx,
      el
    ) {
      if ($(this).next().is("h6.edTag")) {
        const position = parseInt($(this).nextAll("h6:first").text());
        const artist = $(this).nextAll("h3").eq(0).text();
        const title = $(this).nextAll("h3").eq(1).text().trim();
        const youtube = $(this)
          .nextAll(".video")
          .eq(0)
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

  await runUploadServer(data.flat(), SOURCE.NPR, 2022);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
