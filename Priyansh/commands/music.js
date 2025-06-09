const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "music",
    aliases: ["audio", "song"],
    version: "1.3",
    author: "Nobita",
    countDown: 5,
    role: 0,
    shortDescription: "Download audio or video from YouTube",
    longDescription: "Searches YouTube and downloads audio in MP3 format or video in MP4 format.",
    category: "media",
    guide: "{pn} [video]"
  },

  onStart: async function ({ message, args }) {
    if (!args.length) return message.reply("❌ Please provide a song name.");

    let videoQuery = args.join(" ");
    let isVideo = videoQuery.toLowerCase().endsWith("video");
    if (isVideo) videoQuery = videoQuery.replace(/ video$/i, "");

    try {
      message.reply("🔎 Searching for the song...");

      const searchResults = await yts(videoQuery);
      if (!searchResults.videos.length) return message.reply("⚠️ No results found.");

      const video = searchResults.videos[0];
      const videoUrl = video.url;
      const videoTitle = video.title;
      const thumbnail = video.thumbnail;

      console.log(`✅ Fetching ${isVideo ? "MP4" : "MP3"} for: ${videoTitle} (${videoUrl})`);

      // 🔄 New API format
      const apiUrl = `https://noobs-xyz-aryan.vercel.app/youtube?id=${encodeURIComponent(video.title)}&type=${isVideo ? "video" : "audio"}&apikey=itzaryan`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.url) {
        console.log("❌ API response invalid:", response.data);
        return message.reply("❌ Failed to fetch the file. Try again later.");
      }

      const fileUrl = response.data.url;
      console.log(`✅ File URL received: ${fileUrl}`);

      await message.reply({
        body: `🎵 *Title:* ${videoTitle}\n🔗 *YouTube Link:* ${videoUrl}`,
        attachment: await global.utils.getStreamFromURL(thumbnail)
      });

      const filePath = path.join(__dirname, "cache", `${Date.now()}.${isVideo ? "mp4" : "mp3"}`);
      const fileStream = await global.utils.getStreamFromURL(fileUrl);

      if (!fileStream) {
        console.log("❌ Failed to get file stream.");
        return message.reply("❌ Could not download the file.");
      }

      const writer = fs.createWriteStream(filePath);
      fileStream.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({ attachment: fs.createReadStream(filePath) });
        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }, 10000);
      });

    } catch (error) {
      console.error("🚨 Music Command Error:", error);
      return message.reply(`⚠️ Error: ${error.message}`);
    }
  }
};
