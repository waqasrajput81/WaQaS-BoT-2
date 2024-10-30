module.exports.config = {
    name: "food",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Get an image of any food item based on its name",
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
    
    // Bing Image Search API key and endpoint
    const apiKey = 'YOUR_BING_API_KEY'; // Replace with your Bing API key
    const endpoint = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(foodName)}&count=1`;

    try {
        // Fetch image from Bing Image Search API
        const response = await axios.get(endpoint, {
            headers: { 'Ocp-Apim-Subscription-Key': apiKey }
        });

        // Extract the first image URL
        const imageUrl = response.data.value[0].contentUrl;
        const ext = imageUrl.split('.').pop().split('?')[0];

        // Send the image to the chat
        let callback = function () {
            api.sendMessage({
                attachment: fs.createReadStream(__dirname + `/cache/food.${ext}`)
            }, event.threadID, () => fs.unlinkSync(__dirname + `/cache/food.${ext}`), event.messageID);
        };

        request(imageUrl).pipe(fs.createWriteStream(__dirname + `/cache/food.${ext}`)).on("close", callback);
    } catch (error) {
        console.error(error);
        api.sendMessage("Sorry, I couldn't find an image for that food item. Try something else!", event.threadID, event.messageID);
    }
};
