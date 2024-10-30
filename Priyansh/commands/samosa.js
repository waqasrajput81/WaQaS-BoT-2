module.exports.config = {
  name: "samosa",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
  description: "Random samosa image",
  commandCategory: "Image",
  usages: "samosa",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async ({ api, event, Currencies }) => {
  const axios = global.nodemodule["axios"];
  const request = global.nodemodule["request"];
  const fs = global.nodemodule["fs-extra"];
  
  // Updated image links
  var link = [
    "https://i.postimg.cc/BQkc59ym/a89aa57e7b91c725708482abed87c1cf.jpg", "https://i.postimg.cc/6QwZz9hf/d2e19e4f86ed65d1c53731226a8a25a7.jpg", "https://i.postimg.cc/Vk9rJxcr/120edd3b880f0753962a56f7b5c01d1d.jpg", "https://i.postimg.cc/QVGCtb4J/b0fabd4c29ac8e499b64dc2990b2c78a.jpg", "https://i.postimg.cc/YS9WTdJv/7c1e0f89d45343a1cf764ce8ac8a10a8.jpg", "https://i.postimg.cc/zvnbT6Rc/018944cacf0bd71083fb8786897aaf2f.jpg", "https://i.postimg.cc/3J1W7gjm/9b139719f15cf31bc88352e81c0985c8.jpg", "https://i.postimg.cc/vB5HK9H1/84fa279dc94301c9bb6d627eb6d612e4.jpg"
  ];
  
  // Check user balance
  var data = await Currencies.getData(event.senderID);
  var money = data.money;
  
  // If the user has less than 200, send a message and stop
  if (money < 200) {
    return api.sendMessage("You need 200$ to see the photo!", event.threadID, event.messageID);
  } else {
    // Deduct 200 from user balance and send response
    Currencies.setData(event.senderID, { money: money - 200 });
    
    // Send a message before the image
    api.sendMessage("𝗔𝗖𝗛𝗔 𝗚 𝗟𝗚𝗧𝗔 𝗕𝗛𝗢𝗢𝗞 𝗟𝗚 𝗚𝗔𝗘𝗬 𝗛𝗬 𝗝𝗡𝗔𝗕 𝗞𝗢 𝗗𝗘𝗧𝗔 𝗛𝗨 𝗦𝗔𝗠𝗢𝗦𝗔", event.threadID, async (err, info) => {
      // Add reaction to the user's message
      await api.setMessageReaction("😋", event.messageID, true);
      
      // Send the image after the message
      var callback = () => api.sendMessage(
        { body: "Enjoy your samosa! 😋", attachment: fs.createReadStream(__dirname + "/cache/samosa.jpg") },
        event.threadID,
        () => fs.unlinkSync(__dirname + "/cache/samosa.jpg"),
        event.messageID
      );
      
      return request(encodeURI(link[Math.floor(Math.random() * link.length)]))
        .pipe(fs.createWriteStream(__dirname + "/cache/samosa.jpg"))
        .on("close", () => callback());
    });
  }
};
