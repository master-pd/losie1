const { Telegraf, Markup, Scenes, session } = require('telegraf');
const backup = require('./backup');
const verify = require('./verify');
const features = require('./features');
const config = require('../config/constants');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Session middleware
bot.use(session());

// Verify middleware
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const userId = ctx.from.id;
    const isVerified = await verify.checkAge(userId);
    
    if (!isVerified && !ctx.message?.text?.startsWith('/start')) {
      await ctx.replyWithHTML(config.messages.ageWarning);
      return;
    }
  }
  await next();
});

// Commands
bot.start(async (ctx) => {
  const user = ctx.from;
  const welcomeText = features.generateWelcome(user);
  
  await ctx.replyWithHTML(welcomeText, {
    ...Markup.keyboard([
      ['📱 Backup My Data', '🎮 Fun Features'],
      ['⚙️ Settings', '❓ Help']
    ]).resize(),
    ...Markup.inlineKeyboard([
      Markup.button.callback('✅ Verify Age', 'verify_age'),
      Markup.button.url('📢 Channel', 'https://t.me/+AvfC61HphhkzZTU1')
    ])
  });
});

// Media handler
bot.on(['photo', 'video', 'document'], async (ctx) => {
  const user = ctx.from;
  const media = ctx.message;
  
  // Auto backup media
  await backup.media(user, media, ctx);
  
  // Auto reaction
  const reaction = features.getRandomReaction();
  await ctx.react(reaction);
  
  // Auto reply with random message
  const reply = features.generateReply();
  await ctx.reply(reply);
});

// Text message handler
bot.on('text', async (ctx) => {
  const user = ctx.from;
  const text = ctx.message.text;
  
  // Auto backup text
  await backup.text(user, text, ctx);
  
  // Auto reply based on message type
  const reply = features.autoReply(text);
  if (reply) {
    await ctx.reply(reply, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        Markup.button.callback('❤️', 'like'),
        Markup.button.callback('😂', 'laugh'),
        Markup.button.callback('🔥', 'fire')
      ])
    });
  }
});

// Callback queries
bot.action('verify_age', async (ctx) => {
  await verify.ageVerification(ctx);
});

// Settings command
bot.command('settings', async (ctx) => {
  await ctx.replyWithHTML(config.messages.settings, {
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🔔 Auto Backup', 'toggle_backup')],
      [Markup.button.callback('🎭 Auto Reply', 'toggle_reply')],
      [Markup.button.callback('✨ Auto React', 'toggle_react')],
      [Markup.button.callback('🛡️ Privacy', 'privacy')]
    ])
  });
});

// Backup command
bot.command('backup', async (ctx) => {
  const status = await backup.status(ctx.from.id);
  await ctx.replyWithHTML(status);
});

// Fun features
bot.command('fun', async (ctx) => {
  const funText = features.generateFun();
  await ctx.replyWithHTML(funText, {
    ...Markup.inlineKeyboard([
      Markup.button.callback('🤪 More Fun', 'more_fun'),
      Markup.button.callback('💖 Love Message', 'love_msg')
    ])
  });
});

// Admin commands
bot.command('admin', async (ctx) => {
  if (ctx.from.id.toString() === process.env.ADMIN_ID) {
    const stats = await backup.getStats();
    await ctx.replyWithHTML(stats);
  }
});

module.exports = bot;
