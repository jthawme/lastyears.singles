const config = require("../knexfile");
const { getTrack } = require("./spotify");
const knex = require("knex")(config.development);

const getSearched = async (title, artist, source, year) => {
  const result = await knex("searched")
    .where({
      title,
      artist,
      source,
      year,
    })
    .first()
    .then((result) => result);

  return result;
};

const getSongById = async (id) => {
  return knex("song")
    .where({ id })
    .first()
    .then((res) => res);
};

const getSongBySpotify = async (spotifyId) => {
  return knex("song")
    .where({ spotify_id: spotifyId })
    .first()
    .then((res) => res);
};

const saveSong = async (spotifyId, youtubeLink) => {
  const song = await getSongBySpotify(spotifyId);

  if (!song) {
    const track = await getTrack(spotifyId);

    const data = {
      spotify_id: spotifyId,
      youtube_link: youtubeLink,
      artists: track.artists.map((artist) => artist.name).join("!@!"),
      title: track.name,
      preview: track.preview_url,
    };

    return knex("song")
      .insert(data)
      .then((id) => ({
        ...data,
        id: id[0],
      }));
  }

  return song;
};

const updateSongPreview = async (songId) => {
  const song = await getSongById(songId);
  const track = await getTrack(song.spotify_id);

  return knex("song")
    .update({
      preview: track.preview_url,
    })
    .where({ id: songId })
    .then(() => ({ ...song, preview: track.preview_url }));
};

const saveSearched = async (songId, title, artist, source, position, year) => {
  return knex("searched").insert({
    song_id: songId,
    title,
    artist,
    source,
    position,
    year,
  });
};

const updateSearched = async (id, data) => {
  return knex("searched").update(data).where({ id });
};

const getSongs = async () => {
  const rows = await knex("song")
    .innerJoin("searched", "searched.song_id", "song.id")
    .select("song.*", "searched.position", "searched.source", "searched.year")
    .then((res) => res);

  return Object.values(
    rows.reduce((prev, curr) => {
      const { position, source, year, spotify_id, artists, ...rest } = curr;
      if (!prev[curr.id]) {
        prev[curr.id] = {
          ...rest,
          artists: artists.split("!@!"),
          spotify_id: spotify_id.split("?").shift(),
          positions: [],
        };
      }

      prev[curr.id].positions.push({
        source,
        position,
        year,
      });

      return prev;
    }, {})
  );
};

const getRandomSong = async (year = 2021, limit = 10) => {
  const rows = await knex("song")
    .innerJoin("searched", "searched.song_id", "song.id")
    .select("song.*", "searched.position", "searched.source", "searched.year")
    .where("searched.year", year)
    .orderBy(knex.raw("RANDOM()"))
    .limit(limit)
    .then((res) => res);

  return rows.map((row) => ({
    ...row,
    spotify_id: row.spotify_id.split("?").shift(),
  }));
};

const reduceSongStructure = (songs) => {
  return songs.reduce((prev, curr) => {
    const { positions, ...rest } = curr;

    positions.forEach((position) => {
      const key = `${position.source}-${position.year}`;
      if (!prev[key]) {
        prev[key] = [];
      }

      prev[key].push({ ...rest, positions: position.position });
    });

    return prev;
  }, {});
};

module.exports = {
  knex,
  getSearched,
  saveSong,
  saveSearched,
  updateSearched,
  getSongs,
  getRandomSong,
  reduceSongStructure,
  updateSongPreview,
};
