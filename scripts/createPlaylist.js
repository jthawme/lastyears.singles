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

const getPlaylistName = (source) => {
  const s = source.split("-");
  const year = s.splice(s.length - 1, 1);

  const baseName = s.join("-");

  if (!NAMES[baseName]) {
    throw new Error(`${baseName} has no pretty name`);
  }

  return `${NAMES[baseName]} Top Songs ${year}`;
};

const getInitialSongs = async () => {
  const songs = await getSongs();

  return reduceSongStructure(songs);
};

const createPlaylistIfNotExist = async (source, items) => {
  const playlistName = getPlaylistName(source);

  const existing = await getPlaylist(playlistName);

  if (existing) {
    return updatePlaylist(
      existing,
      items,
      `Listen to all the end of year lists https://lastyears.singles/list/${source}`
    );
  }

  return createPlaylist(
    playlistName,
    items,
    `Listen to all the end of year lists https://lastyears.singles/list/${source}`
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
        items.map((item) => item.spotify_id)
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
})();
