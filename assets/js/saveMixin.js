import { SAVED_KEY } from "./constants";

export const SavedMixin = {
  mounted() {
    this.getSongs();
    requestAnimationFrame(() => this.getAllSongs());
  },
  computed: {
    likedSongs() {
      return this.$store.state.liked.items;
    },
  },
  methods: {
    getAllSongs() {
      return fetch("/all.json")
        .then((resp) => resp.json())
        .then((items) => this.$store.commit("liked/setSongs", items));
    },
    getSongs() {
      const items = localStorage.getItem(SAVED_KEY);

      if (items) {
        try {
          const parsedItems = JSON.parse(items);

          this.$store.commit("liked/setLikedItems", parsedItems);
        } catch {}
      }
    },
  },
  watch: {
    likedSongs(val) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(val));
    },
  },
};

export const SaveMixin = {
  computed: {
    likedSongs() {
      return this.$store.state.liked.items;
    },
    spotify() {
      return this.$store.state.spotify.object;
    },
  },
  methods: {
    toggleLikeSong(id, spotifyId) {
      if (this.likedSongs.includes(id)) {
        this.$store.commit("liked/removeLikedItem", id);

        if (this.spotify) {
          this.spotify.removeFromMySavedTracks([spotifyId]);
        }
      } else {
        plausible("Liked", { props: { song: id } });
        this.$store.commit("liked/addLikedItem", id);

        if (this.spotify) {
          this.spotify.addToMySavedTracks([spotifyId]);
        }
      }
    },
  },
};
