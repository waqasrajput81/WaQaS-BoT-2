module.exports.config = {
  name: "biryani", // Changed from "meme" to "biryani"
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
  description: "Random joke image",
  commandCategory: "Image",
  usages: "biryani",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async ({ api, event, args, Users, Threads, Currencies }) => {
  const axios = global.nodemodule["axios"];
  const request = global.nodemodule["request"];
  const fs = global.nodemodule["fs-extra"];
  var link = ["https://i.imgur.com/zoQxUwC.jpg", "https://i.imgur.com/bXVBasN.jpg", "https://i.imgur.com/E3bMZMM.jpg", /* other links */ ];
  
  var max = Math.floor(Math.random() * 6);
  var min = Math.floor(Math.random() * 2);
  var data = await Currencies.getData(event.senderID);
  var exp = data.exp;
  var money = data.money;
  
  if (money < 200) {
    api.sendMessage("You need 200$ to see the photo!", event.threadID, event.messageID);
  } else {
    Currencies.setData(event.senderID, options = { money: money - 200 });
    var callback = () => api.sendMessage(
      { body: `MADE BY ZAIN PRINCE: ${link.length}`, attachment: fs.createReadStream(__dirname + "/cache/1.jpg") },
      event.threadID,
      () => fs.unlinkSync(__dirname + "/cache/1.jpg"),
      event.messageID
    );
    
    return request(encodeURI(link[Math.floor(Math.random() * link.length)] + (max - min)))
      .pipe(fs.createWriteStream(__dirname + "/cache/1.jpg"))
      .on("close", () => callback());
  }
};
