const path = require('path');

class Features {
  constructor() {
    this.replies = require('../gen/reply');
    this.dirty = require('../gen/dirty');
    this.love = require('../gen/love');
    this.fun = require('../gen/fun');
    this.hot = require('../gen/hot');
    this.reactions = require('../data/reaction.json');
  }

  generateWelcome(user) {
    const borders = require('../data/border.json');
    const border = borders[Math.floor(Math.random() * borders.length)];
    
    const welcomeMessages = [
      `✨ <b>Welcome, ${user.first_name}!</b> ✨\nI'm 𝗟𝗢𝗦𝗜𝗘, your personal backup assistant!`,
      `🌟 <b>Hello ${user.first_name}!</b> 🌟\nReady to backup your memories?`,
      `🎉 <b>Hey ${user.first_name}!</b> 🎉\nYour data is safe with me!`
    ];

    const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    return `${border}\n\n${message}\n\n${border}`;
  }

  getRandomReaction() {
    return this.reactions[Math.floor(Math.random() * this.reactions.length)];
  }

  generateReply() {
    const replies = this.replies.messages;
    return replies[Math.floor(Math.random() * replies.length)];
  }

  autoReply(text) {
    text = text.toLowerCase();
    
    if (text.includes('love') || text.includes('প্রেম')) {
      return this.getRandomLove();
    } else if (text.includes('fun') || text.includes('মজা')) {
      return this.getRandomFun();
    } else if (text.includes('hot') || text.includes('সেক্সি')) {
      return this.getRandomHot();
    } else if (text.includes('dirty') || text.includes('আশকেল')) {
      return this.getRandomDirty();
    }
    
    return this.generateReply();
  }

  getRandomLove() {
    return this.love.messages[Math.floor(Math.random() * this.love.messages.length)];
  }

  getRandomFun() {
    return this.fun.messages[Math.floor(Math.random() * this.fun.messages.length)];
  }

  getRandomHot() {
    return this.hot.messages[Math.floor(Math.random() * this.hot.messages.length)];
  }

  getRandomDirty() {
    return this.dirty.messages[Math.floor(Math.random() * this.dirty.messages.length)];
  }

  generateFun() {
    const funTypes = [
      '🎮 Let\'s play a game!',
      '😂 Here\'s a joke for you!',
      '🎭 Time for some fun!',
      '✨ Let me entertain you!'
    ];
    
    const selected = funTypes[Math.floor(Math.random() * funTypes.length)];
    const joke = this.getRandomFun();
    
    return `${selected}\n\n${joke}`;
  }
}

module.exports = new Features();
