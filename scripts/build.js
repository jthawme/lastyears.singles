const jsonfile = require("jsonfile");
const path = require("path");
const { getSongs } = require("./db");

getSongs().then((data) => {
  jsonfile.writeFileSync(path.join(__dirname, "../static/all.json"), data);

  const reduced = data.reduce((prev, curr) => {
    const { positions, ...rest } = curr;

    positions.forEach((position) => {
      if (!prev[position.source]) {
        prev[position.source] = [];
      }

      prev[position.source].push({ ...rest, positions: position.position });
    });

    return prev;
  }, {});

  Object.entries(reduced).forEach(([source, items]) => {
    items.sort((a, b) => b.positions - a.positions);

    jsonfile.writeFileSync(
      path.join(__dirname, `../static/${source}.json`),
      items
    );
  });
  process.exit();
});
