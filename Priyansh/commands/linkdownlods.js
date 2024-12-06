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

// Command list with attributes
const commands = [
    {
        name: "video",
        description: "Handles video download links.",
        usage: "Send a valid video link (e.g., TikTok, YouTube, Instagram) to download.",
        execute: async (sender_psid, message, message_id) => {
            if (isVideoLink(message)) {
                // React with ⏳ for download in progress
                reactToMessage(message_id, "⏳");

                sendMessage(sender_psid, { text: "Wait please, the video is downloading..." });

                const videoUrl = await downloadVideo(message);

                if (videoUrl) {
                    // React with ✅ for successful download
                    reactToMessage(message_id, "✅");

                    sendMessage(sender_psid, { text: "Here is your video:" });
                    sendMessage(sender_psid, { attachment: { type: "video", payload: { url: videoUrl } } });
                } else {
                    sendMessage(sender_psid, { text: "Sorry, I couldn't download the video." });
                }
            } else {
                sendMessage(sender_psid, { text: "Please send a valid video link." });
            }
        },
    },
    {
        name: "help",
        description: "Lists all available commands.",
        usage: "Type 'help' to get a list of commands.",
        execute: (sender_psid) => {
            let helpText = "Here are the available commands:\n\n";
            commands.forEach((command) => {
                helpText += `★ ${command.name}\n   - Description: ${command.description}\n   - Usage: ${command.usage}\n\n`;
            });
            sendMessage(sender_psid, { text: helpText });
        },
    },
];

// Handle messages
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async (entry) => {
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                const message = webhook_event.message.text.toLowerCase();
                const message_id = webhook_event.message.mid;

                // Match and execute the appropriate command
                const command = commands.find((cmd) => message.includes(cmd.name) || isVideoLink(message));
                if (command) {
                    command.execute(sender_psid, message, message_id);
                } else {
                    sendMessage(sender_psid, { text: "Command not recognized. Type 'help' for a list of commands." });
                }
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

const isVideoLink = (url) => {
    const videoPlatforms = ["tiktok.com", "youtube.com", "youtu.be", "instagram.com", "facebook.com"];
    return videoPlatforms.some((platform) => url.includes(platform));
};

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

const reactToMessage = (message_id, reaction) => {
    axios.post(
        `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        {
            recipient: { id: message_id },
            sender_action: reaction === "✅" ? "mark_seen" : null, // Replace with appropriate reaction if supported
        }
    )
        .then(() => console.log("Reaction sent!"))
        .catch((error) => console.error("Error sending reaction:", error));
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
