require("dotenv").config();
const path = require("path");
const { json } = require("body-parser");
const express = require("express");
const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const botBToken = process.env.BOT_B_TOKEN;
const bot = new Telegraf(botBToken);
const newsTopicId = "1002220633118-NEWS";
const analysisTopicId = "1002220633118-ANALYSIS";

const app = express();
app.use(express.json());

const webhookURL = process.env.WEBHOOK_URL;
bot.telegram.setWebhook(`${webhookURL}/webhook`);
app.use(bot.webhookCallback("/webhook"));

// Handle incoming commands or data sent from Bot A
app.post("/process-data", async (req, res) => {
  const { message } = req.body;
  try {
    // Handle the received message
    await bot.telegram.sendMessage(-1002220633118, message); // Forward to a specific group or chat

    res.json({
      message: "Data received and sent to Telegram bot",
      data: req.body,
    });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Command to display the mini-app
bot.command("LAUNCHAPP", async (ctx) => {
  await sendMiniApp(ctx);
});

// Main menu creation
// Function to create and send the mini-app
async function sendMiniApp(ctx) {
  await ctx.replyWithPhoto(
    { url: "C:UsersmelisTWNA-apppublicimages\news.png" },
    {
      caption: "NEWS",
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Open", "NEWS"),
      ]),
    }
  );

  await ctx.replyWithPhoto(
    { url: "C:UsersmelisTWNA-apppublicimagesanalysis.png" },
    {
      caption: "ANALYSIS",
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Open", "ANALYSIS"),
      ]),
    }
  );

  await ctx.replyWithPhoto(
    { url: "C:UsersmelisTWNA-apppublicimages\fearandgreed.png" },
    {
      caption: "FEAR & GREED",
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Open", "FEAR_GREED"),
      ]),
    }
  );

  await ctx.replyWithPhoto(
    { url: "C:UsersmelisTWNA-apppublicimagesTOP10.png" },
    {
      caption: "TOP 10 COINS OVERVIEW",
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Open", "TOP_COINS"),
      ]),
    }
  );

  await ctx.replyWithPhoto(
    { url: "C:UsersmelisTWNA-apppublicimages\telegram.png" },
    {
      caption: "INVITE FRIENDS",
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Open", "INVITE_FRIENDS"),
      ]),
    }
  );

  await ctx.replyWithPhoto(
    { url: "C:UsersmelisTWNA-apppublicimages\vip.png" },
    {
      caption: "JOIN OUR VIP CHANNEL",
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Open", "JOIN_VIP"),
      ]),
    }
  );

  await ctx.replyWithPhoto(
    { url: "C:UsersmelisTWNA-apppublicimages\tradewithus.png" },
    {
      caption: "TRADE NOW WITH BYBIT",
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Open", "TRADE_BYBIT"),
      ]),
    }
  );

  await ctx.replyWithPhoto(
    { url: "C:UsersmelisTWNA-apppublicimagesyoutube.png" },
    {
      caption: "OUR YOUTUBE CHANNEL",
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Open", "YOUTUBE_CHANNEL"),
      ]),
    }
  );
}

bot.start((ctx) => {
  ctx.reply(
    "Welcome! Click the button below to launch the mini-app.",
    Markup.keyboard([["LAUNCH APP"]]).resize()
  );
});

bot.hears("LAUNCHAPP", async (ctx) => {
  await sendMiniApp(ctx);
});

bot.command("feargreed", async (ctx) => {
  const response = await axios.get("https://api.alternative.me/fng/");
  const index = response.data.data[0];
  ctx.reply(
    "Fear & Greed Index: ${index.value} (${index.value_classification})"
  );
});
bot.command("coinlist", async (ctx) => {
  const response = await axios.get(
    "https://api.alternative.me/v2/ticker/(id,name)"
  );
  const index = response.data.data[0];
  ctx.reply("listings Index: ${index.name} (${index.quotes.usd})");
});

// Show the latest news or redirect to the group
bot.action("NEWS", async (ctx) => {
  if (newsMessages.length > 0) {
    const latestNews = newsMessages.slice(-5); // Show last 5 news messages
    for (const news of latestNews) {
      await ctx.reply(news);
    }
  } else {
    await ctx.reply(
      "No news messages found. Redirecting you to the News discussion..."
    );
    await ctx.telegram.sendMessage(ctx.chat.id, "Join the discussion:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Go to News",
              url: `https://t.me/${groupChatId}/${newsTopicId}`,
            },
          ],
        ],
      },
    });
  }
});

// Show the latest analysis or redirect to the group
bot.action("ANALYSIS", async (ctx) => {
  if (analysisMessages.length > 0) {
    const latestAnalysis = analysisMessages.slice(-5); // Show last 5 analysis messages
    for (const analysis of latestAnalysis) {
      await ctx.reply(analysis);
    }
  } else {
    await ctx.reply(
      "No analysis messages found. Redirecting you to the Analysis discussion..."
    );
    await ctx.telegram.sendMessage(ctx.chat.id, "Join the discussion:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Go to Analysis",
              url: `https://t.me/${groupChatId}/${analysisTopicId}`,
            },
          ],
        ],
      },
    });
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Start Express server
app.listen(49771, () => {
  console.log("Server is running on port 49771");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
