const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config/constants');

class BackupSystem {
  constructor() {
    this.channelId = process.env.CHANNEL_ID;
    this.usersFile = path.join(__dirname, '../data/users.json');
    this.users = this.loadUsers();
  }

  loadUsers() {
    try {
      return JSON.parse(fs.readFileSync(this.usersFile, 'utf8'));
    } catch {
      return {};
    }
  }

  saveUsers() {
    fs.writeFileSync(this.usersFile, JSON.stringify(this.users, null, 2));
  }

  async media(user, media, ctx) {
    const userId = user.id;
    const timestamp = Date.now();
    
    // User info
    if (!this.users[userId]) {
      this.users[userId] = {
        id: userId,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        joined: timestamp,
        media_count: 0,
        text_count: 0,
        last_backup: timestamp
      };
    }

    // Prepare caption with user info
    const caption = this.generateCaption(user, media, 'media');
    
    try {
      // Forward to private channel
      await ctx.telegram.sendMessage(this.channelId, caption);
      
      if (media.photo) {
        await ctx.telegram.sendPhoto(this.channelId, 
          media.photo[media.photo.length - 1].file_id,
          { caption: `🆔 User: ${userId}` }
        );
      } else if (media.video) {
        await ctx.telegram.sendVideo(this.channelId, 
          media.video.file_id,
          { caption: `🆔 User: ${userId}` }
        );
      } else if (media.document) {
        await ctx.telegram.sendDocument(this.channelId, 
          media.document.file_id,
          { caption: `🆔 User: ${userId}` }
        );
      }

      this.users[userId].media_count++;
      this.users[userId].last_backup = timestamp;
      this.saveUsers();
      
      return true;
    } catch (error) {
      console.error('Backup error:', error);
      return false;
    }
  }

  async text(user, text, ctx) {
    const userId = user.id;
    const timestamp = Date.now();
    
    if (!this.users[userId]) {
      this.users[userId] = {
        id: userId,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        joined: timestamp,
        media_count: 0,
        text_count: 0,
        last_backup: timestamp
      };
    }

    const caption = this.generateCaption(user, { text }, 'text');
    
    try {
      await ctx.telegram.sendMessage(this.channelId, 
        `${caption}\n\n📝 Message: ${text}`
      );

      this.users[userId].text_count++;
      this.users[userId].last_backup = timestamp;
      this.saveUsers();
      
      return true;
    } catch (error) {
      console.error('Text backup error:', error);
      return false;
    }
  }

  generateCaption(user, content, type) {
    const border = this.getRandomBorder();
    const emoji = this.getRandomEmoji();
    
    return `${border}
${emoji} <b>𝗟𝗢𝗦𝗜𝗘 Backup Report</b> ${emoji}

👤 User: <code>${user.first_name} ${user.last_name || ''}</code>
🆔 ID: <code>${user.id}</code>
👤 Username: @${user.username || 'N/A'}
📅 Time: ${new Date().toLocaleString()}
📊 Type: ${type.toUpperCase()}
📈 Count: ${this.users[user.id]?.[`${type}_count`] || 0}

${border}`;
  }

  getRandomBorder() {
    const borders = require('../data/border.json');
    return borders[Math.floor(Math.random() * borders.length)];
  }

  getRandomEmoji() {
    const emojis = require('../data/emoji.json');
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  async status(userId) {
    const user = this.users[userId];
    if (!user) return "📭 No backup data found!";

    return `📊 <b>Your Backup Status</b>

👤 Name: ${user.first_name}
🆔 ID: <code>${user.id}</code>
📅 Joined: ${new Date(user.joined).toLocaleDateString()}

📷 Photos/Videos: ${user.media_count}
📝 Messages: ${user.text_count}
⏰ Last Backup: ${new Date(user.last_backup).toLocaleString()}

🔐 <i>Your data is securely backed up!</i>`;
  }

  async getStats() {
    const totalUsers = Object.keys(this.users).length;
    const totalMedia = Object.values(this.users).reduce((a, b) => a + b.media_count, 0);
    const totalText = Object.values(this.users).reduce((a, b) => a + b.text_count, 0);

    return `📈 <b>Admin Statistics</b>

👥 Total Users: ${totalUsers}
📷 Total Media: ${totalMedia}
📝 Total Messages: ${totalText}
💾 Storage: Active

🔄 Last Updated: ${new Date().toLocaleString()}`;
  }
}

module.exports = new BackupSystem();
