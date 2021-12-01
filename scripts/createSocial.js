const path = require("path");
const fs = require("fs");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { exec } = require("child_process");

const TMP_FOLDER = path.join(__dirname, "tmp");
const tmp = (file) => path.join(TMP_FOLDER, file);

registerFont(path.join(__dirname, "../assets/fonts/GT-Cinetype-Bold.woff"), {
  family: "GT Cinetype",
});

const SIZES = {
  SQUARE: {
    WIDTH: 1000,
    HEIGHT: 1000,
    IMAGE: path.join(__dirname, "public/images/bg-transparent.png"),
  },
  WIDE: {
    WIDTH: 1200,
    HEIGHT: 630,
    IMAGE: path.join(
      __dirname,
      "public/images/social-background-wide-transparent.png"
    ),
  },
};

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

const makeTextFrame = async (
  text,
  scale = 0.1,
  bg = "#FFD98F",
  size = "SQUARE"
) => {
  const { WIDTH, HEIGHT, IMAGE } = SIZES[size];

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const w = (perc) => WIDTH * perc;
  const h = (perc) => HEIGHT * perc;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w(1), h(1));
  const img = await loadImage(IMAGE);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // ctx.fillStyle = `#b7babb`;
  ctx.fillStyle = `#272727`;
  ctx.textBaseline = "top";
  ctx.font = `${w(scale)}px GT Cinetype`;

  fillText(ctx, `${text}`, w(0.05), h(0.05), w(0.9));

  // const buffer = canvas.toBuffer("image/png");
  // fs.writeFileSync(path.join(__dirname, `../static/${source}-${year}.png`), buffer);

  return canvas;
};

const makeImageFrame = async (
  image,
  scale = 1,
  bg = "#FFD98F",
  size = "SQUARE"
) => {
  const { WIDTH, HEIGHT, IMAGE } = SIZES[size];

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const w = (perc) => WIDTH * perc;
  const h = (perc) => HEIGHT * perc;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w(1), h(1));

  const img = await loadImage(IMAGE);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const topImg = await loadImage(image);

  const imgWidth = w(scale);
  const imgHeight = (topImg.height / topImg.width) * imgWidth;

  ctx.drawImage(
    topImg,
    (w(1) - imgWidth) / 2,
    (h(1) - imgHeight) / 2,
    imgWidth,
    imgHeight
  );

  return canvas;
};

const frameFileName = (frameNum = 0) => {
  return frameNum.toString().padStart(3, "0");
};

const saveFrame = async (canvasPromise, frameNum = 0) => {
  const canvas = await Promise.resolve().then(() => canvasPromise);
  const target = tmp(`${frameFileName(frameNum)}.png`);

  fs.writeFileSync(target, canvas.toBuffer());

  return Promise.resolve(target);
};

const ffmpeg = (cmd) => {
  return new Promise(async (resolve) => {
    const child = exec(`ffmpeg ${cmd}`);

    // child.stdout.pipe(process.stdout);
    // child.stderr.pipe(process.stdout);

    child.on("exit", function () {
      resolve();
    });
  });
};

const convertImageToVideo = async (image, frameNum = 0, time = 1) => {
  const target = tmp(`${frameFileName(frameNum)}.mp4`);

  await ffmpeg(
    `-y -loop 1 -i ${image} -t ${time} -c:v libx264 -pix_fmt yuv420p -r 60 ${target}`
  );

  return target;
};

const deleteFiles = (files) => {
  files.forEach((file) => fs.unlinkSync(file));
};

/**
 *
 * - type: 'text'
 *   time: 1
 *   data:
 *     text: string
 *     scale: number
 *
 * - type: 'image'
 *   time: 1
 *   data:
 *     image: string
 *     scale: number
 */
const makeAnimation = async (frames, bg = "#FFD98F", size = "SQUARE") => {
  if (!fs.existsSync(TMP_FOLDER)) {
    fs.mkdirSync(TMP_FOLDER);
  }

  const savedFrames = await Promise.all(
    frames.map((frame, idx) => {
      if (frame.type === "text") {
        return saveFrame(
          makeTextFrame(frame.data.text, frame.data.scale, bg, size),
          idx
        );
      }
      if (frame.type === "image") {
        return saveFrame(
          makeImageFrame(frame.data.image, frame.data.scale, bg, size),
          idx
        );
      }
    })
  );

  const savedVideos = await Promise.all(
    savedFrames.map((frame, idx) => {
      return convertImageToVideo(frame, idx, frames[idx].time || 1);
    })
  );

  fs.writeFileSync(
    tmp("list.txt"),
    savedVideos.map((v) => `file ${v}`).join("\n")
  );
  await ffmpeg(
    `-f concat -safe 0 -i ${tmp("list.txt")} -y -c copy ${tmp("output.mp4")}`
  );

  deleteFiles([...savedFrames, ...savedVideos, tmp("list.txt")]);

  // console.log(savedVideos);
  return tmp("output.mp4");
};

function ordinalSuffix(i) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

function blinkText(text, { amt = 4, time = 1, scale = 0.1 } = {}) {
  return new Array(amt)
    .fill(0)
    .map((v, idx) => {
      return [
        {
          type: "text",
          time,
          data: {
            text,
            scale,
          },
        },
        {
          type: "text",
          time: time / 2,
          data: {
            text: ` `,
            scale,
          },
        },
      ];
    })
    .flat();
}

module.exports = { makeAnimation, ordinalSuffix, blinkText };
