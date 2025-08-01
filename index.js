// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Telegraf } = require("telegraf");

const app = express();
app.use(cors());

const bot = new Telegraf(process.env.BOT_TOKEN);

// Create invoice and return the slug
app.get("/create-invoice", async (req, res) => {
  try {
    const chatId = req.query.chat_id;
    if (!chatId) return res.status(400).json({ error: "chat_id is required" });

    const message = await bot.telegram.sendInvoice(
      chatId,
      "Premium Feature",               // title
      "Unlock premium features",      // description
      "payload_123",                  // payload (must match)
      "",                             // provider_token is empty for Telegram Stars
      "startparam",                   // start_param (optional)
      "XTR",                          // currency for Telegram Stars
      [{ label: "Premium Access", amount: 100 }] // amount = 1.00 stars
    );

    const slug = message.invoice.slug;
    res.json({ slug });
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ error: "Could not create invoice" });
  }
});

// Payment handling
bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true));

bot.on("successful_payment", (ctx) => {
  console.log("✅ PAYMENT RECEIVED:", ctx.message.successful_payment);
  ctx.reply("Thank you for the Stars! Premium unlocked.");
});

// Root
app.get("/", (req, res) => {
  res.send("✅ Backend is alive!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

bot.launch();