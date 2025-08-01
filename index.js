require("dotenv").config(); const express = require("express"); const { Telegraf } = require("telegraf"); const cors = require("cors");

const app = express();

// ✅ CORS setup for frontend app.use(cors({ origin: "http://localhost:5173", credentials: true, }));

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧾 Create invoice app.get("/create-invoice", async (req, res) => { try { const chatId = req.query.chat_id || "7493947448";

const message = await bot.telegram.sendInvoice(
  chatId,
  "Premium Feature",
  "Access cool stuff",
  "payload_123",
  "",
  "startparam",
  "XTR",
  [{ label: "Premium", amount: 100 }]
);

const slug = message.invoice.slug;
console.log("✅ Invoice created:", slug);
res.json({ slug });

} catch (err) { console.error("❌ Invoice error:", err); res.status(500).json({ error: "Could not create invoice" }); } });

bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true)); bot.on("successful_payment", (ctx) => { console.log("💸 Payment success:", ctx.message.successful_payment); ctx.reply("Thanks for paying! Premium unlocked 🎉"); });

app.get("/", (req, res) => { res.send("Backend is alive 🧠"); });

const PORT = process.env.PORT || 3001; app.listen(PORT, () => { console.log(🚀 Backend running on http://localhost:${PORT}); });

bot.launch().then(() => { console.log("🤖 Telegram bot is running"); });

