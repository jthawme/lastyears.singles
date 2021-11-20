require("../bootstrap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { runUpload, runUploadServer } = require("../upload");
const { SOURCE } = require("../constants");
const { getPlaylist, getFullPlaylist } = require("../spotify");

const run = async () => {
  const playlist = await getFullPlaylist("2WfP3mGUpywvXYy21lnGJq");

  const tracks = playlist.tracks.items.map(({ track }, idx, arr) => ({
    spotifyTrack: `https://open.spotify.com/track/${track.id}`,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    position: arr.length - idx,
  }));

  await runUploadServer(tracks, SOURCE.BIG_J_THE_WIZARD_KING, 2021);
  // runUpload(songs, SOURCE.PITCHFORK);
};

run();
