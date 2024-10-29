module.exports.config = {
  name: "nudegirl",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
  description: "nude image of anime girl",
  commandCategory: "nsfw",
  usages: "nudegirl",
  cooldowns: 3,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async ({ api, event }) => {
  // Check if the sender's ID matches your UID
  if (event.senderID !== "100086033644262") { // Replace with your UID if different
    return api.sendMessage("You do not have permission to use this command.", event.threadID);
  }

  var links = [
    "https://imgur.com/meyGJvz.jpg",
    "https://imgur.com/2n4l5Yq.jpg",
    "https://imgur.com/PxngxOD.jpg",
    "https://imgur.com/A0fbJ6d.jpg",
    "https://imgur.com/sEkcx60.jpg",
    "https://imgur.com/PB2RoCl.jpg",
    "https://imgur.com/Fu4sWId.jpg",
    "https://imgur.com/NrReaFG.jpg",
    "https://imgur.com/CrdN1mS.jpg",
    "https://imgur.com/rGyiCqb.jpg",
    "https://imgur.com/wXZGi7T.jpg",
    "https://imgur.com/Mu92PEc.jpg",
    "https://imgur.com/sZMd93X.jpg",
    "https://imgur.com/1kXE6eJ.jpg",
    "https://imgur.com/CWDtOXZ.jpg",
    "https://imgur.com/s1W3c57.jpg",
    "https://imgur.com/QDlVYDW.jpg",
    "https://imgur.com/6APRg4d.jpg",
    "https://imgur.com/qitBUPy.jpg",
    "https://imgur.com/LwgzvVk.jpg",
    "https://imgur.com/PxVGoau.jpg",
    "https://imgur.com/Tz00ugw.jpg",
    "https://imgur.com/aWStCHt.jpg",
    "https://imgur.com/ERPxzhs.jpg",
    "https://imgur.com/igTYusM.jpg",
    "https://imgur.com/lUsHdL0.jpg",
    "https://imgur.com/P4MwhIi.jpg",
    "https://imgur.com/qP4MZJW.jpg",
    "https://imgur.com/XOQUPus.jpg",
    "https://imgur.com/uRNq4q5.jpg",
    "https://imgur.com/hvhj5Av.jpg",
    "https://imgur.com/19M5A6q.jpg",
    "https://i.imgur.com/FK16e5v.jpg",
  ];

  // Send a random image link from the list
  const randomLink = links[Math.floor(Math.random() * links.length)];
  return api.sendMessage({ body: `Here is an image: ${randomLink}` }, event.threadID, event.messageID);
};
