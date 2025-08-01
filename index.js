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
    const chatId = req.query.chat_id || "7493947448"; // Replace this with your own Telegram user ID for testing

    const message = await bot.telegram.sendInvoice(
      chatId,
      "Premium Feature",                // title
      "Access cool stuff",             // description
      "payload_123",                   // payload (must match in frontend)
      "",                              // empty provider token = use Telegram Stars
      "startparam",                    // start_param
      "XTR",                           // currency (Telegram Stars)
      [{ label: "Premium", amount: 100 }] // price (in 0.01 stars, so 100 = 1.00 star)
    );

    lastInvoiceSlug = message.invoice.slug;
    console.log("✅ Invoice created:", lastInvoiceSlug);
    res.json({ slug: lastInvoiceSlug });

  } catch (err) {
    console.error("❌ Invoice error:", err);
    res.status(500).json({ error: "Could not create invoice" });
  }
});

// Handle pre-checkout and payment success
bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true));

bot.on("successful_payment", (ctx) => {
  console.log("✅ PAYMENT RECEIVED:", ctx.message.successful_payment);
  ctx.reply("Thanks for paying! You now have premium access.");
});

// Define root route for sanity check
app.get("/", (req, res) => {
  console.log("✅ Root route hit");
  res.send("Backend is alive 🧠");
});

// Use dynamic port for deployment platforms like Render or Cyclic
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

bot.launch().then(() => {
  console.log("🤖 Bot is running");
});