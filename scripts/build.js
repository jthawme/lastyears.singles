const jsonfile = require("jsonfile");
const path = require("path");
const { getSongs, reduceSongStructure } = require("./db");

getSongs().then((data) => {
  jsonfile.writeFileSync(path.join(__dirname, "../static/all.json"), data);

  const reduced = reduceSongStructure(data);

  Object.entries(reduced).forEach(([source, items]) => {
    items.sort((a, b) => b.positions - a.positions);

    jsonfile.writeFileSync(
      path.join(__dirname, `../static/${source}.json`),
      items
    );
  });
  process.exit();
});
