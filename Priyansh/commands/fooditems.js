module.exports.config = {
    name: "food",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Get a picture of a food item",
    commandCategory: "Picture",
    usages: "food [Food Name]",
    cooldowns: 1,
};

module.exports.run = async ({ api, event, args }) => {
    const axios = require('axios');
    const request = require('request');
    const fs = require("fs");
    
    // Check if user provided a food name
    if (!args[0]) {
        return api.sendMessage("Please provide a food name to get an image!", event.threadID, event.messageID);
    }

    // Get the food name from the user input
    const foodName = args.join(" ");
    
    // Generate a food image based on the input
    axios.get(`https://foodish-api.herokuapp.com/api/images/${foodName}`).then(res => {
        let ext = res.data.image.split('.').pop();

        let callback = function () {
            api.sendMessage({
                attachment: fs.createReadStream(__dirname + `/cache/food.${ext}`)
            }, event.threadID, () => fs.unlinkSync(__dirname + `/cache/food.${ext}`), event.messageID);
        };

        request(res.data.image).pipe(fs.createWriteStream(__dirname + `/cache/food.${ext}`)).on("close", callback);
    }).catch(err => {
        // In case the food item is not found, send an error message
        api.sendMessage("Sorry, couldn't find an image for that food item. Try something else!", event.threadID, event.messageID);
    });
};
