const { returnSuccess, returnError } = require("./utils");
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const { refresh } = JSON.parse(event.body);

  const data = {
    refresh_token: refresh,
    grant_type: "refresh_token",
  };

  try {
    const returnData = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: Object.entries(data)
        .map((row) => row.join("="))
        .join("&"),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    }).then((resp) => resp.json());

    return returnSuccess({
      ...returnData,
    });
  } catch (e) {
    return returnError("Error connecting to spotify");
  }
};
