require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");
const cors = require("cors");

const app = express();
app.use(cors());

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🟢 Inline button to launch the web app
bot.start((ctx) => {
  ctx.reply("🚀 Tap below to launch the web app!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🔥 Open Web App",
            web_app: {
              url: "https://frontstar.vercel.app", // Your frontend URL here
            },
          },
        ],
      ],
    },
  });
});

// ✅ Serve invoice to frontend
let lastInvoiceSlug = null;

app.get("/create-invoice", async (req, res) => {
  try {
    const message = await bot.telegram.sendInvoice(
      req.query.chat_id || "7493947448", // fallback for testing
      "Premium Feature",
      "Access cool stuff",
      "payload_123",
      "", // Empty for Telegram Stars
      "startparam",
      "XTR", // Telegram currency (Stars)
      [{ label: "Premium", amount: 100 }] // Amount in stars
    );
    lastInvoiceSlug = message.invoice.slug;
    res.json({ slug: lastInvoiceSlug });
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ error: "Could not create invoice" });
  }
});

// 💳 Handle payment
bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true));
bot.on("successful_payment", (ctx) => {
  console.log("✅ PAYMENT RECEIVED:", ctx.message.successful_payment);
  ctx.reply("Thanks for paying! You now have premium access.");
});

// 🌐 Test backend endpoint
app.get("/", (req, res) => {
  res.send("Backend is alive 🧠");
});

// 🚀 Start
bot.launch();
app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});