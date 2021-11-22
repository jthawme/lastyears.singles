const SpotifyWebApi = require("spotify-web-api-node");
const express = require("express");
const open = require("open");

const timer = (time = 2000, error = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    }, time);
  });
};

let spotifyStored;
const initialiseSpotify = (authCode = false) => {
  if (spotifyStored) {
    return spotifyStored;
  }

  if (authCode) {
    return new Promise((resolve) => {
      const spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_BACKEND_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_BACKEND_CLIENT_SECRET,
        redirectUri: "http://localhost:3000/callback",
      });

      const app = express();
      app.get("/callback", async (req, res) => {
        const data = await spotify.authorizationCodeGrant(req.query.code);
        spotify.setAccessToken(data.body["access_token"]);
        spotify.setRefreshToken(data.body["refresh_token"]);
        spotifyStored = spotify;
        res.send("hey");
        resolve(spotify);
        server.close();
      });

      const server = app.listen(3000, () => {
        var authorizeURL = spotify.createAuthorizeURL(
          ["playlist-modify-public", "user-read-private", "ugc-image-upload"],
          "local"
        );

        open(authorizeURL);
      });
    });
  } else {
    const spotify = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_BACKEND_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_BACKEND_CLIENT_SECRET,
      redirectUri: "http://localhost:3000/callback",
    });

    return spotify.clientCredentialsGrant().then((data) => {
      spotify.setAccessToken(data.body["access_token"]);
      return spotify;
    });
  }
};

const getTrack = async (spotifyId) => {
  try {
    const spotify = await initialiseSpotify();

    const track = await spotify.getTrack(spotifyId).then((value) => value.body);
    return track;
  } catch (e) {
    return handleSpotifyError(e).then(() => {
      return getTrack(spotifyId);
    });
  }
};

let userId = null;
const getUserId = async (spotify) => {
  if (!userId) {
    const me = await spotify.getMe();
    userId = me.id;
  }

  return userId;
};

const getPlaylist = async (name) => {
  try {
    const spotify = await initialiseSpotify(true);

    const userId = await getUserId(spotify);
    const data = await spotify.getUserPlaylists(userId, { limit: 50 });

    return data.body.items.find((item) => item.name === name);
  } catch (e) {
    return handleSpotifyError(e, true).then(() => {
      return getPlaylist(name);
    });
  }
};

const getFullPlaylist = async (playlistId) => {
  try {
    const spotify = await initialiseSpotify(true);

    const data = await spotify.getPlaylist(playlistId);

    return data.body;
  } catch (e) {
    return handleSpotifyError(e, true).then(() => {
      return getPlaylist(name);
    });
  }
};

const createPlaylist = async (name, uris, description, image) => {
  try {
    const spotify = await initialiseSpotify(true);
    const playlist = await spotify
      .createPlaylist(name, { description, collaborative: false, public: true })
      .then((data) => data.body);
    await spotify.addTracksToPlaylist(
      playlist.id,
      uris.map((u) => `spotify:track:${u}`)
    );
    await spotify.uploadCustomPlaylistCoverImage(playlist.id, image);

    return playlist;
  } catch (e) {
    return handleSpotifyError(e, true).then(() => {
      return createPlaylist(name, uris, description);
    });
  }
};

const updatePlaylist = async (playlist, uris, description, image) => {
  try {
    const spotify = await initialiseSpotify(true);

    await spotify.changePlaylistDetails(playlist.id, {
      description,
    });
    await spotify.replaceTracksInPlaylist(
      playlist.id,
      uris.map((u) => `spotify:track:${u}`)
    );
    await spotify.uploadCustomPlaylistCoverImage(playlist.id, image);

    return playlist;
  } catch (e) {
    return handleSpotifyError(e, true).then(() => {
      return updatePlaylist(playlist, uris, description);
    });
  }
};

const handleSpotifyError = (e, authCode = false) => {
  if (e.statusCode === 429) {
    const retryAfter = e.headers["retry-after"]
      ? parseInt(e.headers["retry-after"])
      : 5;

    return timer(retryAfter * 1000);
  }

  if (e.statusCode === 401) {
    return initialiseSpotify(authCode);
  }

  console.log(e.statusCode);

  throw new Error(e);
};

module.exports = {
  initialiseSpotify,
  getTrack,
  getPlaylist,
  getFullPlaylist,
  createPlaylist,
  updatePlaylist,
};
