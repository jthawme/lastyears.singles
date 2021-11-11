const config = require("../knexfile");
const { getTrack } = require("./spotify");
const knex = require("knex")(config.development);

const getSearched = async (title, artist, source) => {
  const result = await knex("searched")
    .where({
      title,
      artist,
      source,
    })
    .first()
    .then((result) => result);

  return result;
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

const saveSearched = async (songId, title, artist, source, position) => {
  return knex("searched").insert({
    song_id: songId,
    title,
    artist,
    source,
    position,
  });
};

const getSongs = async () => {
  const rows = await knex("song")
    .innerJoin("searched", "searched.song_id", "song.id")
    .select("song.*", "searched.position", "searched.source")
    .then((res) => res);

  return Object.values(
    rows.reduce((prev, curr) => {
      const { position, source, spotify_id, artists, ...rest } = curr;
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
      });

      return prev;
    }, {})
  );
};

module.exports = { knex, getSearched, saveSong, saveSearched, getSongs };
