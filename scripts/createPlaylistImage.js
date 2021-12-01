const path = require("path");
const fs = require("fs");
const {
  createCanvas,
  loadImage,
  registerFont,
  measureText,
} = require("canvas");
const { NAMES, COLORS } = require("./constants");

registerFont(path.join(__dirname, "../assets/fonts/GT-Cinetype-Bold.woff"), {
  family: "GT Cinetype",
});

const WIDTH = 800;
const canvas = createCanvas(WIDTH, WIDTH);
const ctx = canvas.getContext("2d");

function fillText(ctx, text, startX, startY, maxWidth, spacing = 0) {
  const DELIMITER = "!@!";
  const words = text.split("\n").join(` ${DELIMITER} `).split(" ");

  ctx.save();
  ctx.translate(startX, startY);

  let row = 0;
  let x = 0;

  const { emHeightDescent } = ctx.measureText("M");
  const lineHeight = emHeightDescent * 1;

  words.forEach((word) => {
    const { width } = ctx.measureText(`${word} `);

    if (word === DELIMITER || x + width > maxWidth) {
      x = 0;
      row++;
    }

    if (word !== DELIMITER) {
      ctx.fillText(word, x, row * lineHeight);

      x += width;
    }
  });

  ctx.restore();
}

const makeImage = async (source, songsLength, year) => {
  const w = (perc) => WIDTH * perc;
  const h = (perc) => WIDTH * perc;

  ctx.fillStyle = COLORS[Object.keys(NAMES).indexOf(source) % COLORS.length];
  ctx.fillRect(0, 0, w(1), h(1));

  const img = await loadImage(
    path.join(__dirname, "public/images/bg-transparent.png")
  );
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // ctx.fillStyle = `#b7babb`;
  ctx.fillStyle = `#272727`;
  ctx.textBaseline = "top";
  ctx.font = `${w(0.1)}px GT Cinetype`;

  fillText(
    ctx,
    `${NAMES[source]}\nTop ${songsLength} songs\n${year}`,
    w(0.05),
    h(0.05),
    w(0.9)
  );

  // const buffer = canvas.toBuffer("image/png");
  // fs.writeFileSync(path.join(__dirname, `../static/${source}-${year}.png`), buffer);

  return canvas
    .toDataURL("image/jpeg", 1)
    .replace("data:image/jpeg;base64,", "");
};

module.exports = { makeImage };
