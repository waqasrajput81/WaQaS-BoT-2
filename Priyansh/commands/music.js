const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

module.exports.config = {
    name: "music",
    version: "1.0.0",
    hasPermission: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Get music by searching and downloading from YouTube",
    commandCategory: "music",
    usages: "music <song name>",
    cooldowns: 10,
};

module.exports.onLaunch = async function ({ api, event, target }) {
    if (!target[0]) {
        return api.sendMessage(`❌ Please enter a music name!`, event.threadID);
    }

    try {
        const song = target.join(" ");
        const findingMessage = await api.sendMessage(`🔍 | Finding "${song}". Please wait...`, event.threadID);

        const searchResults = await yts(song);
        const firstResult = searchResults.videos[0];

        if (!firstResult) {
            await api.editMessage(`❌ | No results found for "${song}".`, findingMessage.messageID, event.threadID);
            return;
        }

        const { title, url } = firstResult;

        await api.editMessage(`⏱️ | Music Title has been Found: "${title}". Downloading...`, findingMessage.messageID);

        const filePath = path.resolve(__dirname, 'cache', `${Date.now()}-${title}.mp3`);

        // Ensure the 'cache' directory exists
        if (!fs.existsSync(path.resolve(__dirname, 'cache'))) {
            fs.mkdirSync(path.resolve(__dirname, 'cache'));
        }

        const responseStream = ytdl(url, {
            quality: 'highestaudio',
            filter: format => format.audioBitrate > 0,
            highWaterMark: 1 << 25 
        });

        const fileStream = fs.createWriteStream(filePath);

        responseStream.pipe(fileStream);

        fileStream.on('finish', async () => {
            const stats = fs.statSync(filePath);
            const fileSizeInMB = stats.size / (1024 * 1024);

            if (fileSizeInMB > 25) {
                await api.editMessage(`❌ | The file size exceeds 25MB limit. Unable to send "${title}".`, findingMessage.messageID, event.threadID);
                fs.unlinkSync(filePath);
                return;
            }

            const bold = global.fonts ? global.fonts.bold("Music Player") : "Music Player"; 
            await api.sendMessage({
                body: `🎵 ${bold}\n${global.line || ""}\nHere is your music about your search "${song}"\n\nTitle: ${title}\nYoutube Link: ${url}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID);

            fs.unlinkSync(filePath);
            api.unsendMessage(findingMessage.messageID);
        });

        responseStream.on('error', async (error) => {
            console.error("Stream error: ", error);
            await api.editMessage(`❌ | Error during download: ${error.stack || JSON.stringify(error)}`, findingMessage.messageID, event.threadID);
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error("Catch block error: ", error);
        await api.editMessage(`❌ | An unexpected error occurred: ${error.stack || JSON.stringify(error)}`, event.threadID);
    }
};

module.exports.run = function ({ api, event }) {
    // Optionally handle direct run command if needed
};
