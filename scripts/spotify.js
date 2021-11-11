const SpotifyWebApi = require("spotify-web-api-node");

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

const initialiseSpotify = () => {
  const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  return spotify.clientCredentialsGrant().then((data) => {
    spotify.setAccessToken(data.body["access_token"]);
    return spotify;
  });
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

const handleSpotifyError = (e) => {
  if (e.statusCode === 429) {
    const retryAfter = e.headers["retry-after"]
      ? parseInt(e.headers["retry-after"])
      : 5;

    return timer(retryAfter * 1000);
  }

  if (e.statusCode === 401) {
    return initialiseSpotify();
  }

  console.log(e.statusCode);

  throw new Error(e);
};

module.exports = { initialiseSpotify, getTrack };
