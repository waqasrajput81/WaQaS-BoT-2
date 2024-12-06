const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Messenger webhook verification
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async (entry) => {
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                const message = webhook_event.message.text;

                if (isVideoLink(message)) {
                    // Notify user about the download process
                    sendMessage(sender_psid, { text: "⏳ Wait please, your video is being downloaded..." });

                    const videoUrl = await downloadVideo(message);
                    if (videoUrl) {
                        sendMessage(sender_psid, { text: "✅ Here is your video:" });
                        sendMessage(sender_psid, {
                            attachment: { type: "video", payload: { url: videoUrl } },
                        });
                    } else {
                        sendMessage(sender_psid, { text: "❌ Sorry, I couldn't download the video." });
                    }
                } else {
                    sendMessage(sender_psid, { text: "⚠️ Please send a valid video link." });
                }
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

// Check if a message contains a video link
const isVideoLink = (url) => {
    const videoPlatforms = ["tiktok.com", "youtube.com", "youtu.be", "instagram.com", "facebook.com"];
    return videoPlatforms.some((platform) => url.includes(platform));
};

// Download the video using a third-party API
const downloadVideo = async (url) => {
    try {
        const apiEndpoint = `https://some-video-downloader-api.com/download`; // Replace with an actual API
        const response = await axios.post(apiEndpoint, { url });
        return response.data.videoUrl; // Adjust based on API response
    } catch (error) {
        console.error("Error downloading video:", error);
        return null;
    }
};

// Send a message back to the user
const sendMessage = (sender_psid, response) => {
    const request_body = {
        recipient: { id: sender_psid },
        message: response,
    };

    axios.post(
        `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        request_body
    )
        .then(() => console.log("Message sent!"))
        .catch((error) => console.error("Error sending message:", error));
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
``
