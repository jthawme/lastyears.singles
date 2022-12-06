require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");

const targetUrl =
  "https://www.theguardian.com/music/2022/dec/05/the-20-best-songs-of-2022";

const run = async () => {
  const code = await fetch(targetUrl).then((resp) => resp.text());
  const $ = cheerio.load(code);

  const positions = [];
  const artists = [];
  const titles = [];
  const spotify = [];

  const h2s = $(
    ".article-body-commercial-selector h2, .article-body-commercial-selector figure"
  ).each(function (idx, el) {
    if ($(this).get(0).tagName === "figure") {
      if (
        $(this).attr("data-spacefinder-type") !==
        "model.dotcomrendering.pageElements.EmbedBlockElement"
      ) {
        return;
      }

      const props = $(this).find("gu-island").attr("props");

      if (props) {
        const { html, source } = JSON.parse(props);

        if (source === "Spotify" && !!html) {
          const spotifyId = html.split("track/")[1].split("?utm").shift();
          spotify.push(
            `https://open.spotify.com/track/${spotifyId}?autoplay=true`
          );
        } else {
          spotify.push(null);
        }
      }
    } else {
      if (isNaN(parseInt($(this).attr("id")))) {
        const [artist, title] = $(this).text().trim().split(` – `);

        artists.push(artist);
        titles.push(title);
      } else {
        positions.push($(this).text().trim());
      }
    }
  });

  const merged = positions.reduce((p, c, idx) => {
    return [
      ...p,
      {
        position: c,
        title: titles[idx],
        artist: artists[idx],
        spotifyTrack: spotify[idx],
      },
    ];
  }, []);

  // $(".article-body-commercial-selector h2").each(function (idx, el) {
  //   const position = $(this).text().trim();

  //   // const [position, ...rest] = text.split(".");
  //   // const afterText = rest.join(".");
  //   // const [artist, title] = afterText.split(" – ");

  //   songs.push({
  //     title: $(this).next("h2").parent().text().trim(),
  //     // artist: artist.trim(),
  //     position,
  //   });
  // });

  // console.log(songs);

  await runUploadServer(merged, SOURCE.GUARDIAN, 2022);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
