const PROJECT_TITLE = "Last Years Singles";
const PROJECT_DESCRIPTION =
  "Listen to last years greatest songs as decided by the internet's largest reaching music sources";
const PROJECT_KEYWORDS =
  "Last Years Singles, End of year list, 2021 best songs, 2021 top songs, top songs, pitchfork top 100"; // add more
const PROJECT_DOMAIN = "https://lastyears.singles";

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: "static",

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: PROJECT_TITLE,
    titleTemplate: `%s - ${PROJECT_TITLE}`,
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0",
      },
      { name: "referrer", content: "no-referrer" },
      {
        name: "title",
        content: PROJECT_TITLE,
      },
      {
        hid: "description",
        name: "description",
        content: PROJECT_DESCRIPTION,
      },
      {
        name: "keywords",
        content: PROJECT_KEYWORDS,
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      { name: "twitter:site", content: "@mschfxyz" },
      {
        name: "twitter:title",
        content: PROJECT_TITLE,
      },
      {
        name: "twitter:description",
        content: PROJECT_DESCRIPTION,
      },
      {
        name: "twitter:image:src",
        content: `${PROJECT_DOMAIN}/social/sharecard-twitter.png`,
      },
      {
        name: "og:title",
        property: "og:title",
        content: PROJECT_TITLE,
      },
      { name: "og:type", property: "og:type", content: "website" },
      {
        name: "og:url",
        property: "og:url",
        content: `${PROJECT_DOMAIN}`,
      },
      {
        name: "og:image",
        property: "og:image",
        content: `${PROJECT_DOMAIN}/social/sharecard-facebook.png`,
      },
      {
        name: "og:description",
        property: "og:description",
        content: PROJECT_DESCRIPTION,
      },
      {
        name: "og:site_name",
        property: "og:site_name",
        content: PROJECT_TITLE,
      },
      { name: "author", content: "MSCHF" },
      { meta: "msapplication-TileColor", content: "#ffffff" },
      { meta: "msapplication-TileImage", content: "/ms-icon-144x144.png" },
      { meta: "theme-color", content: "#ffffff" },
    ],
    script: [
      {
        src: "https://plausible.io/js/plausible.js",
        ["data-domain"]: "lastyears.singles",
        defer: true,
      },
      {
        innerHTML: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`,
        type: "text/javascript",
        charset: "utf-8",
      },
    ],
    __dangerouslyDisableSanitizers: ["script", "innerHTML"],
    // link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["normalize.css"],

  styleResources: {
    scss: ["~/assets/scss/common.scss"],
  },

  plugins: [],

  components: {
    dirs: ["~/components", "~/components/common"],
  },

  buildModules: ["@nuxtjs/svg", "@nuxtjs/style-resources"],

  modules: ["@nuxtjs/pwa", "@nuxt/http"],

  pwa: {
    manifest: {
      lang: "en",
    },
  },

  build: {
    extend(config, context) {
      if (context.isClient) {
        config.externals = ["fs", "path"];
      }
    },
  },
};
