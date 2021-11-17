import Spotify from "spotify-web-api-js";
import queryString from "query-string";
import { ACCESS_TOKEN_KEY } from "./constants";

export const getSpotify = (token, expires) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, `${expires}:${token}`);

  const s = new Spotify();
  s.setAccessToken(token);

  return s;
};

const getRedirectURI = () => {
  return `${
    window.location.hostname.includes("localhost")
      ? `http://localhost:3000`
      : window.location.origin
  }/`;
};

export const getSpotifyAuthoriseUrl = (stateToken) => {
  const baseURL = "https://accounts.spotify.com/authorize";

  return queryString.stringifyUrl({
    url: baseURL,
    query: {
      client_id: "9a5456b308b54bf2bf221cb80bb938c5",
      response_type: "token",
      scope:
        "user-library-modify,user-read-playback-state,streaming,user-read-private,user-read-email",
      redirect_uri: getRedirectURI(),
      state: stateToken,
    },
  });
};
