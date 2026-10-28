/**
 * NEXREEL AI — Standalone Telegram Payment Approval Bot
 * 
 * Ushbu skript orqali kompyuteringizda yoki serveringizda doimiy Telegram Bot ishga tushirishingiz mumkin.
 * 
 * O'rnatish va Ishga tushirish:
 * 1. npm install node-telegram-bot-api
 * 2. BOT_TOKEN va ADMIN_CHAT_ID larni o'rnating.
 * 3. node scripts/telegram-bot.js
 */

const TelegramBot = require('node-telegram-bot-api');

// O'zingizning BotFather bergan tokeningiz:
const BOT_TOKEN = process.env.BOT_TOKEN || '9223798428:AAF6LQXC_keybg0lUZ-fNXbEYiIz-JqNXRg';

// O'zingizning Telegram Chat ID raqamingiz:
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '5126649501';

if (BOT_TOKEN === 'SIZNING_BOT_TOKENINGIZ') {
  console.log("⚠️ Iltimos, BOT_TOKEN va ADMIN_CHAT_ID ni kiriting!");
  console.log("1. Telegramda @BotFather ga kiring va /newbot qiling.");
  console.log("2. @userinfobot ga kirib Chat ID oling.");
  console.log("3. Ushbu faylda BOT_TOKEN va ADMIN_CHAT_ID o'zgaruvchilarini to'ldiring.");
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 NEXREEL AI To'lov Boti ishga tushdi...");

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Assalomu alaykum! NEXREEL AI administrator botiga xush kelibsiz.\n\nSizning Chat ID: ${chatId}\n\nUshbu bot saytdagi barcha to'lov so'rovlarini sizga yuboradi.`);
});

// To'lov so'rovlarini qabul qilish va inline tugmalar orqali tasdiqlash
bot.on('callback_query', (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (data.startsWith('approve_')) {
    const contact = data.replace('approve_', '');
    bot.editMessageText(
      query.message.text + `\n\n✅ <b>TASDIQLANDI!</b> (Administrator ruxsat berdi)`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
      }
    );
    bot.answerCallbackQuery(query.id, { text: `✅ ${contact} uchun obuna tasdiqlandi!` });
  } else if (data.startsWith('reject_')) {
    const contact = data.replace('reject_', '');
    bot.editMessageText(
      query.message.text + `\n\n❌ <b>RAD ETILDI!</b>`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
      }
    );
    bot.answerCallbackQuery(query.id, { text: `❌ ${contact} so'rovi rad etildi.` });
  }
});
