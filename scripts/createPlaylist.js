require("./bootstrap");
const jsonfile = require("jsonfile");
const path = require("path");
const { getPlaylist, createPlaylist, initialiseSpotify } = require("./spotify");
const { NAMES, SOURCE } = require("./constants");
const { getSongs } = require("./db");
const year = 2020;

const getPlaylistName = (source) => {
  return `${NAMES[source]} Top Songs ${year}`;
};

const getInitialSongs = async () => {
  const songs = await getSongs();

  const reduced = songs.reduce((prev, curr) => {
    const { positions, ...rest } = curr;

    positions.forEach((position) => {
      if (!prev[position.source]) {
        prev[position.source] = [];
      }

      prev[position.source].push({
        ...rest,
        positions: position.position,
      });
    });

    return prev;
  }, {});

  return reduced;
};

const createPlaylistIfNotExist = async (source, items) => {
  const playlistName = getPlaylistName(source);

  const existing = await getPlaylist(playlistName);

  if (existing) {
    console.log(`${playlistName} exists already`);
    return existing;
  }

  return createPlaylist(
    playlistName,
    items,
    `Listen to all the end of year lists https://end-of-year-lists.netlify.app/list/${source}`
  );
};

(async () => {
  await initialiseSpotify(true);
  const songs = await getInitialSongs();

  const playlists = await Promise.all(
    Object.entries(songs).map(([source, items]) => {
      items.sort((a, b) => b.position - a.position);

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
