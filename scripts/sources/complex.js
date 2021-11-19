require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrl = "https://www.complex.com/music/best-songs-2020/";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code, { xmlMode: false, decodeEntities: false });

  const songs = [];

  $('script[type="application/ld+json"]').each(function (idx, el) {
    const data = JSON.parse($(this).html());

    if (data["@type"] === "VideoObject") {
      const [artist, ...title] = data.name.split(", ");
      songs.push({
        title: title.join(", ").trim(),
        artist: artist.trim(),
        youtubeLink: data.embedUrl.split("/embed/").join("/watch?v="),
      });
    }
  });

  songs.forEach((song, idx, arr) => {
    song.position = arr.length - idx;
  });

  await runUploadServer(songs, SOURCE.COMPLEX, 2020);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
