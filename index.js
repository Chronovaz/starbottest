require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");
const cors = require("cors");

const app = express();
app.use(cors());

const bot = new Telegraf(process.env.BOT_TOKEN);

// Serve invoice slug to frontend
let lastInvoiceSlug = null;

app.get("/create-invoice", async (req, res) => {
  try {
    const message = await bot.telegram.sendInvoice(
      req.query.chat_id || "7493947448", // for dev, replace with your Telegram user id
      "Premium Feature",
      "Access cool stuff",
      "payload_123",
      "", // empty for Stars
      "startparam",
      "XTR",
      [{ label: "Premium", amount: 100 }]
    );
    lastInvoiceSlug = message.invoice.slug;
    res.json({ slug: lastInvoiceSlug });
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ error: "Could not create invoice" });
  }
});

// Handle pre-checkout & payment
bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true));
bot.on("successful_payment", (ctx) => {
  console.log("✅ PAYMENT RECEIVED:", ctx.message.successful_payment);
  ctx.reply("Thanks for paying! You now have premium access.");
});

bot.launch();
app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});

app.get("/", (req, res) => {
  res.send("Backend is alive 🧠");
});

