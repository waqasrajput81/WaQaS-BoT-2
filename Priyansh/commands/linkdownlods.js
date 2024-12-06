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

// Command metadata
const commands = [
    {
        credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
        description: "Random joke image",
        commandCategory: "Image",
        usages: "burger", // Trigger word for this command
        execute: async (sender_psid) => {
            const randomJokeImageUrl = "https://example.com/random-joke.jpg"; // Replace with a valid image URL
            await sendMessage(sender_psid, { text: "Here's a random joke for you:" });
            await sendMessage(sender_psid, {
                attachment: { type: "image", payload: { url: randomJokeImageUrl } },
            });
        },
    },
];

// Handle incoming messages
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async (entry) => {
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                const message = webhook_event.message.text.trim().toLowerCase();

                // Match the user's message with a command
                const command = commands.find((cmd) => message === cmd.usages);
                if (command) {
                    await command.execute(sender_psid);
                } else {
                    await sendMessage(sender_psid, { text: "⚠️ Command not recognized. Try 'burger'!" });
                }
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

// Function to send messages to the user
const sendMessage = async (sender_psid, response) => {
    const request_body = {
        recipient: { id: sender_psid },
        message: response,
    };

    try {
        await axios.post(
            `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            request_body
        );
        console.log("Message sent!");
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
    }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
