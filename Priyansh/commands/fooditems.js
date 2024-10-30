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

        // Check if there are results
        if (response.data.value && response.data.value.length > 0) {
            const imageUrl = response.data.value[0].contentUrl;
            const ext = imageUrl.split('.').pop().split('?')[0];

            // Send the image to the chat
            let callback = function () {
                api.sendMessage({
                    attachment: fs.createReadStream(__dirname + `/cache/food.${ext}`)
                }, event.threadID, () => fs.unlinkSync(__dirname + `/cache/food.${ext}`), event.messageID);
            };

            request(imageUrl).pipe(fs.createWriteStream(__dirname + `/cache/food.${ext}`)).on("close", callback);
        } else {
            // No results found, fallback to a default image
            api.sendMessage("Sorry, couldn't find an exact image for that item. Here's a general food image.", event.threadID, event.messageID);

            // Path to a local default food image (add this image in the project)
            const defaultImagePath = __dirname + '/cache/default_food.jpg';
            if (fs.existsSync(defaultImagePath)) {
                api.sendMessage({
                    attachment: fs.createReadStream(defaultImagePath)
                }, event.threadID, event.messageID);
            } else {
                api.sendMessage("Default image not found. Please try again later.", event.threadID, event.messageID);
            }
        }
    } catch (error) {
        console.error("Error fetching image:", error.message);
        api.sendMessage("There was an error retrieving the image. Please check back later.", event.threadID, event.messageID);
    }
};
