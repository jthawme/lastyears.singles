require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

// const targetUrl = "https://www.complex.com/music/best-songs-2020/";
// const targetUrl = "https://www.complex.com/music/best-songs-of-2021/";
const targetUrl =
  "https://www.complex.com/music/a/ecleen-luzmila/best-songs-of-2022";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code, { xmlMode: false, decodeEntities: false });

  const songs = [];

  $('div[data-module="sra-youtube-video"]').each(function (idx, el) {
    const { videoId } = JSON.parse(
      $(this).find("script[type='text/x-config']").html().trim()
    );

    const position = $(this).find(".subbuzz__number").text();

    const info = $(this).find(".js-subbuzz__title-text").text();

    const [artist, ...rest] = info.split(", ");

    songs.push({
      position: parseInt(position.slice(0, -1)),
      title: rest.join(", ").slice(1, -1),
      artist: artist.trim(),
      youtubeLink: `https://youtube.com/watch?v=${videoId}`,
    });
  });

  // $('script[type="application/ld+json"]').each(function (idx, el) {
  //   const data = JSON.parse($(this).html());

  //   console.log(data);

  //   if (data["@type"] === "VideoObject") {
  //     const [artist, ...title] = data.name.split(", ");
  //     songs.push({
  //       title: title.join(", ").trim(),
  //       artist: artist.trim(),
  //       youtubeLink: data.embedUrl.split("/embed/").join("/watch?v="),
  //     });
  //   }
  // });

  songs.forEach((song, idx, arr) => {
    song.position = arr.length - idx;
  });

  // console.log(songs);

  await runUploadServer(songs, SOURCE.COMPLEX, 2022);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
