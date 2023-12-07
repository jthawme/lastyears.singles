require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");
const { getPlaylist, getFullPlaylist } = require("../spotify");

const run = async () => {
  // const playlist = await getFullPlaylist("2WfP3mGUpywvXYy21lnGJq"); // 2021
  // const playlist = await getFullPlaylist("1lwtTvyFZLJONjzGxCclCn"); // 2022
  const playlist = await getFullPlaylist("3Upy9YJeZSbVUZiCYZy66D"); // 2023

  const tracks = playlist.tracks.items.map(({ track }, idx, arr) => ({
    spotifyTrack: `https://open.spotify.com/track/${track.id}`,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    position: arr.length - idx,
  }));

  await runUploadServer(tracks, SOURCE.BIG_J_THE_WIZARD_KING, 2023);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
