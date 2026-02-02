const fs = require('fs');
const path = require('path');

class Verification {
  constructor() {
    this.verifiedFile = path.join(__dirname, '../data/verified.json');
    this.verified = this.loadVerified();
  }

  loadVerified() {
    try {
      return JSON.parse(fs.readFileSync(this.verifiedFile, 'utf8'));
    } catch {
      return {};
    }
  }

  saveVerified() {
    fs.writeFileSync(this.verifiedFile, JSON.stringify(this.verified, null, 2));
  }

  async checkAge(userId) {
    return this.verified[userId] || false;
  }

  async ageVerification(ctx) {
    await ctx.replyWithHTML(
      '🔞 <b>Age Verification Required</b>\n\n' +
      'Please confirm you are 18+ years old:\n\n' +
      '<i>By clicking verify, you confirm you meet the age requirement.</i>',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✅ I am 18+',
                callback_data: 'confirm_age'
              },
              {
                text: '❌ Cancel',
                callback_data: 'cancel_age'
              }
            ]
          ]
        }
      }
    );
  }

  async confirmAge(userId) {
    this.verified[userId] = true;
    this.saveVerified();
    return true;
  }
}

module.exports = new Verification();
