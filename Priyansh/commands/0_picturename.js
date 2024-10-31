module.exports.config = {
  name: "name",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
  description: "Add a name to a default background image",
  commandCategory: "dpname",
  usages: "name <text>",
  cooldowns: 1
};

module.exports.wrapText = (ctx, text, maxWidth) => {
  return new Promise((resolve) => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    const words = text.split(" ");
    const lines = [];
    let line = "";
    while (words.length > 0) {
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
        line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = "";
      }
    }
    lines.push(line.trim());
    return resolve(lines);
  });
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const Canvas = global.nodemodule["canvas"];
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  
  const nameText = args.join(" ").trim();
  if (!nameText) {
    return api.sendMessage("Please enter a name after the command, e.g., 'name John Doe'.", threadID, messageID);
  }

  const pathImg = __dirname + `/cache/defaultImage.png`;
  
  // Download the default background image if not already in cache
  if (!fs.existsSync(pathImg)) {
    const defaultImageUrl = "https://i.imgur.com/Vu0AYmH.jpg"; // Replace with your desired default image URL
    const getImage = (await axios.get(defaultImageUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(getImage, "utf-8"));
  }

  // Download font if not already in cache
  if (!fs.existsSync(__dirname + '/cache/SNAZZYSURGE.ttf')) {
    const getFont = (await axios.get(`https://drive.google.com/u/0/uc?id=11YxymRp0y3Jle5cFBmLzwU89XNqHIZux&export=download`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(__dirname + "/cache/SNAZZYSURGE.ttf", Buffer.from(getFont, "utf-8"));
  }

  // Load the default image as the background
  const baseImage = await loadImage(pathImg);
  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  
  // Set font and style
  Canvas.registerFont(__dirname + `/cache/SNAZZYSURGE.ttf`, {
    family: "SNAZZYSURGE"
  });
  ctx.font = "30px SNAZZYSURGE";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  
  // Wrap and position the name text
  const wrappedText = await this.wrapText(ctx, nameText, canvas.width - 40);
  ctx.fillText(wrappedText.join("\n"), canvas.width / 2, canvas.height / 2);
  
  // Convert to image buffer and send
  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  return api.sendMessage(
    { attachment: fs.createReadStream(pathImg) },
    threadID,
    () => fs.unlinkSync(pathImg),
    messageID
  );
};
