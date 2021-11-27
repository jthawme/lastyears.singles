import "regenerator-runtime/runtime";
import { fuzzy } from "fast-fuzzy";

const prep = (txt) =>
  txt
    .replace(/[\W_]+/g, " ")
    .split(" ")
    .join("+");

const createCurrent = (item) => {
  const el = document.createElement("div");
  el.classList.add("current");
  el.innerHTML = `<form class="info">
    <label><input name="songId" type="number" value=""/></label>
    <label>
      <h4>Title</h4>
      <input name="title" readonly value="${item.title}"/>
    </label>
    <label>
      <h4>Artist(s)</h4>
      <input name="artist" readonly value="${item.artist}"/>
    </label>
    <label>
      <h4>Position</h4>
      <input name="position" type="number" value="${item.position}"/>
    </label>
    <label>
      <h4>Youtube</h4>
      <input name="youtubeLink" type="text" value="${item.youtubeLink || ""}"/>
    </label>
    <label>
      <h4>Spotify</h4>
      <input name="spotifyTrack" type="text" value="${
        item.spotifyTrack || ""
      }"/>
    </label>
    <button>Post</button>
    </form>

    <a href="https://www.google.com/search?q=${prep(item.title)}+${prep(
    item.artist
  )}" target="_blank">Google</a>`;

  if (document.querySelector(".current")) {
    document.querySelector(".current").remove();
  }

  document.body.prepend(el);

  const form = document.querySelector(".info");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(e.target);
    const data = [...fd.entries()].reduce((prev, curr) => {
      return {
        ...prev,
        [curr[0]]: curr[1],
      };
    }, {});

    const result = await fetch("/api/submit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((resp) => resp.json());

    console.log(result);

    if (result.success) {
      getNext();
    }
  });
};

const useSong = (item) => {
  document.querySelector('input[name="songId"]').value = item.id;
};

const addSong = (item) => {
  if (document.querySelector(`#song-${item.id}`)) {
    document.querySelector(`#song-${item.id}`).remove();
  }

  const el = document.createElement("div");
  el.classList.add("song");
  el.id = `song-${item.id}`;

  el.innerHTML = `<h4>${item.title} (${item.match.toFixed(
    1
  )})</h4><h5>${item.artists.join(", ")}</h5><button data-id="${
    item.id
  }">Use this</button>`;

  document.querySelector(".pool").appendChild(el);

  const song = item;
  el.querySelector("button").addEventListener("click", () => {
    useSong(song);
  });
};

async function getAll(nextSong) {
  const data = await fetch("/api/all").then((resp) => resp.json());

  const songs = data.songs.slice().map((row) => {
    const titleMatch = fuzzy(nextSong.title, row.title);
    return {
      ...row,
      match: titleMatch,
    };
  });

  songs.sort((a, b) => {
    return b.match - a.match;
  });

  songs.forEach((item) => {
    addSong(item);
  });
}
async function getNext() {
  const data = await fetch("/api/next").then((resp) => resp.json());

  if (data.item) {
    createCurrent(data.item);
    getAll(data.item);
  }
}

getNext();
