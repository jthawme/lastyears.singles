require("./bootstrap");
const jsonfile = require("jsonfile");
const path = require("path");
const {
  getPlaylist,
  createPlaylist,
  initialiseSpotify,
  updatePlaylist,
} = require("./spotify");
const { NAMES, SOURCE } = require("./constants");
const { getSongs, reduceSongStructure } = require("./db");
const { makeImage } = require("./createPlaylistImage");

const getPlaylistDetails = (source) => {
  const s = source.split("-");
  const year = s.splice(s.length - 1, 1);

  const baseName = s.join("-");

  return {
    name: baseName,
    year,
  };
};

const getPlaylistName = (source) => {
  const { name, year } = getPlaylistDetails(source);

  if (!NAMES[name]) {
    throw new Error(`${name} has no pretty name`);
  }

  return `${NAMES[name]} Top Songs ${year}`;
};

const getInitialSongs = async () => {
  const songs = await getSongs();

  return reduceSongStructure(songs);
};

const createPlaylistIfNotExist = async (source, items, max) => {
  const { name, year } = getPlaylistDetails(source);
  const playlistName = getPlaylistName(source);

  const existing = await getPlaylist(playlistName);

  const image = await makeImage(name, max, year);

  if (existing) {
    return updatePlaylist(
      existing,
      items,
      `Listen to all the end of year lists https://lastyears.singles/list/${source}`,
      image
    );
  }

  return createPlaylist(
    playlistName,
    items,
    `Listen to all the end of year lists https://lastyears.singles/list/${source}`,
    image
  );
};

(async () => {
  await initialiseSpotify(true);
  const songs = await getInitialSongs();

  const playlists = await Promise.all(
    Object.entries(songs).map(([source, items]) => {
      items.sort((a, b) => b.positions - a.positions);

      return createPlaylistIfNotExist(
        source,
        items.map((item) => item.spotify_id),
        Math.max(...items.map((item) => item.positions))
      ).then((playlist) => ({
        playlist,
        source,
      }));
    })
  );

  jsonfile.writeFileSync(
    path.join(__dirname, `../static/playlists.json`),
    playlists.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.source]: `spotify:playlist:${curr.playlist.id}`,
      };
    }, {})
  );

  console.log(playlists);

  process.exit();
})();
