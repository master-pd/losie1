require('dotenv').config();
const express = require('express');
const { Telegraf, session } = require('telegraf');
const bot = require('./src/bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Keep Render alive
app.get('/', (req, res) => {
  res.send('🤖 𝗟𝗢𝗦𝗜𝗘 Bot is running 24/7');
});

// Start bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bot running on port ${PORT}`);
});
