require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrls = [
  // "https://consequence.net/2020/12/top-50-songs-of-2020/2/",
  // "https://consequence.net/2020/12/top-50-songs-of-2020/3/",
  // "https://consequence.net/2020/12/top-50-songs-of-2020/4/",
  // "https://consequence.net/2020/12/top-50-songs-of-2020/5/",
  "https://consequence.net/2020/12/top-50-songs-of-2020/6/",
];

const run = async () => {
  const getPage = async (idx = 0) => {
    const code = await fetch(targetUrls[idx]).then((resp) => resp.text());
    const $ = cheerio.load(code);

    const songs = [];

    $(".alm-listing")
      .children()
      .each(function () {
        $(this)
          .find("h2")
          .each(function () {
            let t = $(this).text();

            if (t.includes("Sounds Like:")) {
              t = t.split("Sounds Like:").shift();
            }

            const [position, ...rest] = t.split(". ");
            const [artist, title] = rest.join(". ").split(" – ");

            let spotify;

            if ($(this).next().find("iframe").length) {
              const src = $(this).next().find("iframe").attr("src");

              if (src) {
                spotify = src.split("%3A").pop();
              }
            } else if ($(this).find("iframe").length) {
              spotify = $(this).find("iframe").attr("src").split("%3A").pop();
            }

            songs.push({
              position: parseInt(position),
              artist,
              title,
              spotifyTrack: spotify
                ? `https://open.spotify.com/track/${spotify}`
                : undefined,
            });
          });
      });

    return songs;
  };

  const data = await Promise.all(targetUrls.map((url, idx) => getPage(idx)));

  await runUploadServer(data.flat(), SOURCE.CONSEQUENCE_OF_SOUND, 2020);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
