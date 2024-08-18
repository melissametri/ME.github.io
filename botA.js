const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const botAToken = process.env.BOT_A_TOKEN;
const botBToken = process.env.BOT_B_TOKEN;
const bot = new Telegraf(botAToken);
if (!botAToken) {
  console.error("Bot token is missing in environment variables!");
  process.exit(1);
}

// Group to forward messages from
const groupChatId = -1002197584757;

// Group to receive the forwarded messages
const group2ChatId = -1002220633118;

// Remove unwanted links
function removeUnwantedLinks(text) {
  const urlRegex = /(?:you can read more here:\s*)?(https?:\/\/[^\s]+)/gi;
  return text
    .replace(urlRegex, (match, url) => {
      return url.includes("https://t.me/+UJRqbACZUAZiNDc8") ? match : "";
    })
    .trim();
}

// Categorize messages
let newsMessages = [];
let analysisMessages = [];

// Function to categorize and forward messages
async function categorizeMessage(message, header) {
  let categorizedMessage = "";

  if (header.includes("NEWS")) {
    categorizedMessage = message.text || message.caption || "";
    newsMessages.push(categorizedMessage);
  } else if (header.includes("ANALYSIS")) {
    categorizedMessage = message.text || message.caption || "";
    analysisMessages.push(categorizedMessage);
  }

  // Forward the message to the group
  try {
    await bot.telegram.sendMessage(
      group2ChatId,
      `${header}\n\n${categorizedMessage}`
    );
    // Send the categorized message to Bot B via webhook
    await axios.post(`${process.env.WEBHOOK_URL}/process-data`, {
      message: `${header}\n\n${categorizedMessage}`,
    });
  } catch (error) {
    console.error("Error forwarding message:", error);
  }
}

// Handle incoming messages from the monitored group
bot.on("message", async (ctx) => {
  if (ctx.chat.id === groupChatId) {
    let header = "";

    if (ctx.message.text.toLowerCase().includes("news")) {
      header = "📈 NEWS from Trade with No Aid:";
    } else if (ctx.message.text.toLowerCase().includes("analysis")) {
      header = "📈 ANALYSIS from Trade with No Aid:";
    }

    await categorizeMessage(ctx.message, header);
  }
});

// Initialize Express server
const app = express();
app.use(express.json());
app.use(cors());

// Start the Express server
app.listen(49771, () => {
  console.log("Server running on port 49771");
});

// Start the Telegram bot
http: bot
  .launch()
  .then(() => {
    console.log("Bot A is running...");
  })
  .catch((err) => {
    console.error("Failed to launch the bot A:", err);
  });

// Graceful stop for the bot
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
