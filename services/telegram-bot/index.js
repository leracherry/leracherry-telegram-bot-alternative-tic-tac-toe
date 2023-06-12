const {Telegraf} = require("telegraf");

class TelegrafBotService {
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '')
}

module.exports = new TelegrafBotService()