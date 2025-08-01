// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Telegraf } = require("telegraf");

const app = express();
app.use(cors());
const bot = new Telegraf(process.env.BOT_TOKEN);

// Launch inline WebApp button
bot.start((ctx) => {
  ctx.reply("🚀 Tap below to open the Mini App:", {
    reply_markup: {
      inline_keyboard: [[{
        text: "Open Web App",
        web_app: { url: "https://frontstar.vercel.app" } // your frontend
      }]]
    }
  });
});

// Create invoiceLink endpoint for Mini App
app.get("/create-invoice-link", async (req, res) => {
  try {
    const chatId = req.query.chat_id;
    if (!chatId) return res.status(400).json({ error: "chat_id required" });

    const linkResult = await bot.telegram.createInvoiceLink({
      title: "Premium Feature",
      description: "Unlock premium content",
      payload: "payload_123",
      provider_token: "",
      currency: "XTR",
      prices: [{ label: "Premium Access", amount: 100 }], // 1.00 Star
      start_parameter: "startparam"
    });

    res.json({ invoiceLink: linkResult.invoice_link || linkResult.url });
  } catch (err) {
    console.error("Invoice link error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Payment handling
bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true));
bot.on("successful_payment", (ctx) => {
  console.log("Successful payment:", ctx.message.successful_payment);
  ctx.reply("✔️ Payment received, premium unlocked!");
});

app.get("/", (req, res) => res.send("Backend live!"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
bot.launch();