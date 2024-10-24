const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

module.exports = {
    name: "music",
    usedby: 0,
    version: "1.0.0",
    info: "Get music",
    onPrefix: true,
    dev: "Zain Jutt",
    cooldowns: 10,

    onLaunch: async function ({ api, event, target }) {
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

            // Check if cache directory exists, create it if not
            if (!fs.existsSync(path.resolve(__dirname, 'cache'))) {
                fs.mkdirSync(path.resolve(__dirname, 'cache'));
            }

            const responseStream = ytdl(url, {
                quality: 'highestaudio',
                filter: format => format.audioBitrate > 0,
                highWaterMark: 1 << 25 // Stream size limit
            });

            const fileStream = fs.createWriteStream(filePath);

            responseStream.pipe(fileStream);

            fileStream.on('finish', async () => {
                try {
                    const stats = fs.statSync(filePath);
                    const fileSizeInMB = stats.size / (1024 * 1024);

                    if (fileSizeInMB > 25) {
                        await api.editMessage(`❌ | The file size exceeds 25MB limit. Unable to send "${title}".`, findingMessage.messageID, event.threadID);
                        fs.unlinkSync(filePath);
                        return;
                    }

                    const bold = global.fonts ? global.fonts.bold("Music Player") : "Music Player"; // Check if global.fonts exists
                    await api.sendMessage({
                        body: `🎵 ${bold}\n${global.line || ""}\nHere is your music about your search "${song}"\n\nTitle: ${title}\nYoutube Link: ${url}`,
                        attachment: fs.createReadStream(filePath)
                    }, event.threadID);

                    fs.unlinkSync(filePath);
                    api.unsendMessage(findingMessage.messageID);
                } catch (fileError) {
                    console.error("File system error: ", fileError);
                    await api.editMessage(`❌ | File system error: ${fileError.stack || JSON.stringify(fileError)}`, findingMessage.messageID, event.threadID);
                }
            });

            responseStream.on('error', async (error) => {
                console.error("Response stream error: ", error);
                await api.editMessage(`❌ | Error occurred during download: ${error.stack || JSON.stringify(error)}`, findingMessage.messageID, event.threadID);
                fs.unlinkSync(filePath);
            });

        } catch (error) {
            console.error("Catch block error: ", error);
            await api.editMessage(`❌ | An unexpected error occurred: ${error.stack || JSON.stringify(error)}`, event.threadID);
        }
    }
};
