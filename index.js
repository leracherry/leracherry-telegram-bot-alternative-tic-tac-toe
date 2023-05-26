require('dotenv').config()
const app = require('express')()
const mongoose = require('mongoose')
const PORT = process.env.PORT || 5000
const TelegramBotService = require('./services/telegram-bot')
const bot = TelegramBotService.bot
const UserService = require('./services/user')
const GameService = require('./services/game')
const CanvasService = require('./services/canvas')
const constants = require('./common/constants')

bot.start(async (ctx) => {
    try {
        const id = ctx.message.from.id;
        await UserService.checkNewUser(id)
        return ctx.reply(`Виберіть з ким ви будете грати:`, constants.startBotReplyMarkup);
    } catch (error) {
    }
});

bot.hears('Почати гру', async (ctx) => {
    const id = ctx.update.message.from.id
    const isBot = await UserService.isBotGameType(id)
    if(isBot){
        return ctx.reply(`Виберіть чим будете грати:`, constants.startPlayWithBotMarkup);
    }
    return ctx.reply('Почати гру (скоро)');
});

bot.hears('Змінити тип гри', (ctx) => {
    return ctx.reply(`Виберіть з ким ви будете грати:`, constants.startBotReplyMarkup)
});

bot.action("human", async (ctx) => {
    const id = ctx.update.callback_query.from.id

    await UserService.updateGameType(id, 'human')

    const replyMarkup = {
        keyboard: [
            [{ text: 'Почати гру' },{ text: 'Змінити тип гри' }],
        ],
        resize_keyboard: true, // Позволяет автоматически изменять размер клавиатуры для пользователей
        one_time_keyboard: true, // Клавиатура будет скрыта после нажатия на кнопку
    };

    return ctx.reply('Ви вибрали грати с компьютером', { reply_markup: replyMarkup });
});

bot.action("bot", async (ctx) => {
    const id = ctx.update.callback_query.from.id

    await UserService.updateGameType(id, 'bot')

    const replyMarkup = {
        keyboard: [
            [{ text: 'Почати гру' },{ text: 'Змінити тип гри' }],
        ],
        resize_keyboard: true, // Позволяет автоматически изменять размер клавиатуры для пользователей
        one_time_keyboard: true, // Клавиатура будет скрыта после нажатия на кнопку
    };

    return ctx.reply('Ви вибрали грати с ботом', { reply_markup: replyMarkup });
});

bot.action("cross", async (ctx) => {
    const canvas = CanvasService.createDefaultCanvas()

    // Получение изображения в формате PNG
    const imageBuffer = canvas.toBuffer();

    return await ctx.replyWithPhoto({source: imageBuffer}, {caption: 'Ви граєте: X, виберіть звідки почати', reply_markup: constants.startGameBotX})
});

bot.action("zero", async (ctx) => {
    const id = ctx.update.callback_query.from.id
    const canvas = CanvasService.createDefaultCanvas()

    // Получение изображения в формате PNG
    const imageBuffer = canvas.toBuffer();


    return await ctx.replyWithPhoto({source: imageBuffer}, {caption: 'Ви граєте: 0', reply_markup: constants.gameBoard})


});

bot.action('startGameBotXbtn1', async (ctx) => {
    const id = ctx.update.callback_query.from.id

    await GameService.createBotGame(id, 'X', '1')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);
})
bot.action('startGameBotXbtn2', async (ctx) => {
        const id = ctx.update.callback_query.from.id

        await GameService.createBotGame(id, 'X', '2')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);

})
bot.action('startGameBotXbtn3', async (ctx) => {
        const id = ctx.update.callback_query.from.id

        await GameService.createBotGame(id, 'X', '3')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);

})
bot.action('startGameBotXbtn4', async (ctx) => {
        const id = ctx.update.callback_query.from.id

        await GameService.createBotGame(id, 'X', '4')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);

})
bot.action('startGameBotXbtn5', async (ctx) => {
        const id = ctx.update.callback_query.from.id

        await GameService.createBotGame(id, 'X', '5')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);

})
bot.action('startGameBotXbtn6', async (ctx) => {
        const id = ctx.update.callback_query.from.id

        await GameService.createBotGame(id, 'X', '6')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);

})
bot.action('startGameBotXbtn7', async (ctx) => {
        const id = ctx.update.callback_query.from.id

        await GameService.createBotGame(id, 'X', '7')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);

})
bot.action('startGameBotXbtn8', async (ctx) => {
        const id = ctx.update.callback_query.from.id

        await GameService.createBotGame(id, 'X', '8')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);

})
bot.action('startGameBotXbtn9', async (ctx) => {
        const id = ctx.update.callback_query.from.id

        await GameService.createBotGame(id, 'X', '9')

    const chatId = ctx.update.callback_query.message.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;

    await ctx.telegram.editMessageReplyMarkup(chatId, messageId, null, constants.gameBoard);

})




bot.launch().then()

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || ''),
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            () => console.log('MongoDB connected')
        app.listen(PORT, () => console.log(`App has been started on PORT ${PORT}`))
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
}

start().then()