// Vercel Serverless Function: Telegram Bot Webhook
// Endpoint: https://stdance.ge/api/telegram-webhook

export default async function handler(req, res) {
  // Allow GET requests for status check in browser
  if (req.method === 'GET') {
    return res.status(200).send('🤖 Telegram Bot Webhook is Active & Ready for ST Dance Studio!');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body || {};

    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text.trim();

      // Respond to /start command
      if (text.startsWith('/start')) {
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
        const PHOTO_URL = 'https://stdance.ge/images/dancing_bricks_logo.png';
        const GAME_WEBAPP_URL = 'https://stdance.ge/game';

        const caption = `<b>🕺 კეთილი იყოს თქვენი მობრძანება Dancing Bricks-ში! 🧱</b>\n\n` +
          `ST Dance Studio წარმოგიდგენთ ექსკლუზიურ ცეკვის თამაშსა და ყოველთვიურ გათამაშებას!\n\n` +
          `🏆 <b>როგორ მივიღოთ მონაწილეობა:</b>\n` +
          `• ითამაშე <b>Dancing Bricks</b> და დააგროვე მაღალი ქულები.\n` +
          `• ყოველთვიურად, 20 რიცხვის 22:00 საათზე #1 ადგილოსანს ეძლევა ST Dance Studio & Danceshop.Ge-ს ექსკლუზიური საჩუქრებისა და ვაუჩერების მოგების შანსი!\n\n` +
          `დააჭირე ქვემოთ ღილაკს <b>▶️ ეთამაშე / Play</b> და დაიწყე თამაში! 🚀`;

        const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

        await fetch(telegramApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: PHOTO_URL,
            caption: caption,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '▶️ ეთამაშე / Play',
                    web_app: { url: GAME_WEBAPP_URL }
                  }
                ]
              ]
            }
          })
        });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return res.status(200).json({ ok: true }); // Always return HTTP 200 to Telegram Webhooks
  }
}
