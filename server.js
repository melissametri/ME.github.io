const express = require("express");
const { Telegraf } = require("telegraf");
const path = require("path");
require("dotenv").config();

// Initialize Express app
const app = express();
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.json());

// Initialize Telegram bot
const botBToken = process.env.BOT_B_TOKEN;
const bot = new Telegraf(botBToken);

// Set up Telegram webhook
const webhookURL = process.env.WEBHOOK_URL;

bot.telegram.deleteWebhook().then(() => {
    console.log('Previous webhook deleted, setting new webhook...');
bot.telegram.setWebhook(`${webhookURL}/webhook`).then(() => {
        console.log('Webhook set successfully');
    }).catch((error) => {
        console.error('Failed to set webhook:', error);
    });
}).catch((error) => {
    console.error('Failed to delete previous webhook:', error);
});

app.use(bot.webhookCallback("/webhook"));

// Handle incoming data or commands from Bot A
app.post("/process-data", async (req, res) => {
  const { message } = req.body;
  try {
    await bot.telegram.sendMessage(-1002220633118, message); // Replace with your group/chat ID
    res.json({
      message: "Data received and sent to Telegram bot",
      data: req.body,
    });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start the server on port 49771
const PORT = process.env.PORT || 49771;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Launch the bot
bot
  .launch()
  .then(() => {
    console.log("Bot B is running...");
  })
  .catch((err) => {
    console.error("Failed to launch Bot B:", err);
  });

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
