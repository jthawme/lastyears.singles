const { returnSuccess, returnError } = require("./utils");
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const { code, redirect_uri } = JSON.parse(event.body);

  const data = {
    code,
    redirect_uri,
    grant_type: "authorization_code",
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
