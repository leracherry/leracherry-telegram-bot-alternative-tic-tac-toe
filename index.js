require('dotenv').config();
require('./cron');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const TelegramBotService = require('./services/telegram-bot');
const bot = TelegramBotService.bot;

const UserService = require('./services/user');
const GameService = require('./services/game');
const CanvasService = require('./services/canvas');
const constants = require('./common/constants');
const Game = require('./models/Game');
const User = require('./models/User');

bot.start(async (ctx) => {
  try {
    const id = ctx.chat.id.toString();
    const status = await UserService.checkNewUser(id, ctx);
    if (status === 'block') {
      return ctx.reply(`Вас було заблоковано`);
    }
    return ctx.reply(
      `Виберіть з ким ви будете грати:`,
      constants.startBotReplyMarkup,
    );
  } catch (error) {}
});

bot.command('statistics', async (ctx) => {
  const id = ctx.chat.id.toString();
  const game = await Game.find({
    status: 'ended',
    $or: [{ firstPlayer: id }, { secondPlayer: id }],
  });

  const gameBotList = game.filter((game) => game.gameType === 'bot');
  const gameHumanList = game.filter((game) => game.gameType === 'human');

  const gameBotWinner = gameBotList.filter((game) => game.winner !== 'bot');
  const gameBotLoser = gameBotList.filter((game) => game.winner === 'bot');
  const gameBotDraw = gameBotList.filter((game) => game.winner === 'draw');

  const gameHumanWinner = gameHumanList.filter((game) => game.winner === id);
  const gameHumanLoser = gameHumanList.filter((game) => game.winner !== id);
  const gameHumanDraw = gameHumanList.filter((game) => game.winner === 'draw');

  const gameWinner = game.filter((game) => game.winner === id);
  const gameLoser = game.filter((game) => game.winner !== id);
  const gameDraw = game.filter((game) => game.winner === 'draw');
  return await ctx.reply(
    `Статистика гри з ботом:\n\nПеремоги: ${gameBotWinner.length}${
      isNaN((gameBotWinner.length * 100) / gameBotList.length)
        ? ''
        : `(${(gameBotWinner.length * 100) / gameBotList.length}%)`
    }\nНічиї: ${gameBotDraw.length}${
      isNaN((gameBotDraw.length * 100) / gameBotList.length)
        ? ''
        : `(${(gameBotDraw.length * 100) / gameBotList.length}%)`
    }\nПоразки: ${gameBotLoser.length}${
      isNaN((gameBotLoser.length * 100) / gameBotList.length)
        ? ''
        : `(${(gameBotLoser.length * 100) / gameBotList.length}%)`
    }\nУсього ігор з ботом: ${
      gameBotList.length
    }\n\nСтатистика гри з людьми:\n\nПеремоги: ${gameHumanWinner.length}${
      isNaN((gameHumanWinner.length * 100) / gameHumanList.length)
        ? ''
        : `(${(gameHumanWinner.length * 100) / gameHumanList.length}%)`
    }\nНічиї: ${gameHumanDraw.length}${
      isNaN((gameHumanDraw.length * 100) / gameHumanList.length)
        ? ''
        : `(${(gameHumanDraw.length * 100) / gameHumanList.length}%)`
    }\nПоразки: ${gameHumanLoser.length}${
      isNaN((gameHumanLoser.length * 100) / gameHumanList.length)
        ? ''
        : `(${(gameHumanLoser.length * 100) / gameHumanList.length}%)`
    }\nУсього ігор з людьми: ${
      gameHumanList.length
    }\n\nПідсумкова статистика:\n\nПеремоги: ${gameWinner.length}${
      isNaN((gameWinner.length * 100) / game.length)
        ? ''
        : `(${(gameWinner.length * 100) / game.length}%)`
    }\nНічиї: ${gameDraw.length}${
      isNaN((gameDraw.length * 100) / game.length)
        ? ''
        : `(${(gameDraw.length * 100) / game.length}%)`
    }\nПоразки: ${gameLoser.length}${
      isNaN((gameLoser.length * 100) / game.length)
        ? ''
        : `(${(gameLoser.length * 100) / game.length}%)`
    }\nУсього ігор з ботом: ${game.length}`,
  );
});

bot.command('rules', async (ctx) => {
  const id = ctx.chat.id.toString();
  return await ctx.reply(`Правила гри в альтернативні хрестикинулики:\n\n1. Кожен хід робиться в одному з дрібних полів.
2. Досягнув у маленькому полі розташування трьох однакових фігур у ряд виграє це поле.
3. Щоб виграти гру, необхідно здобути перемоги у трьох маленьких полях у ряд.
Гравець не вибирає одне з дев'яти маленьких полів, у якому хоче ходити. Вибір визначається попереднім перебігом вашого опонента. Клітина в маленькому полі, в яку він сходив - це те маленьке поле, в якому вам належить робити хід. (І клітка, в яку ви сходите, у свою чергу визначає, в якому маленькому полі ходитиме ваш опонент.
  \nЯкщо мій опонент відправляє мене у маленьке поле, в якому вже було здобуто перемогу? Це невдала ситуація. Якщо там залишилися незаповнені клітини, вам доведеться вибрати одну з них. Хоча вплинути на результат гри в цьому полі ви вже не зможете, ви хоч би визначите, де ходитиме ваш опонент.
  \nЯкщо мій опонент відправляє мене в заповнене поле? У цьому випадку, прийміть наші привітання — ви можете вибрати будь-яке з полів для ходу. (Це означає, що вам слід уникати посилань вашого опонента в заповнене поле!))`);
});

bot.command('getactivegame', async (ctx) => {
  const id = ctx.chat.id.toString();
  const status = await UserService.checkNewUser(id, ctx);
  if (status === 'blocked') {
    return ctx.reply(`Вас було заблоковано`);
  }

  const game = await Game.findOne({
    $or: [{ firstPlayer: id }, { secondPlayer: id }],
    status: 'started',
    gameType: 'human',
  });

  if (!game) {
    return await ctx.reply('У вас немає активних ігор');
  }

  const firstPlayer = await User.findOne({ id: game.firstPlayer });
  const secondPlayer = await User.findOne({ id: game.secondPlayer });

  const currentPlayer = firstPlayer.id === id ? firstPlayer : secondPlayer;

  const figure = firstPlayer.id === id ? 'X' : '0';

  const moves = game.moves;

  if (figure === 'X' && currentPlayer.id === firstPlayer.id) {
    if (moves.length === 0) {
      const canvas = CanvasService.createDefaultCanvas();

      const imageBuffer = canvas.toBuffer();

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Гра знайшлась, Ви граєте: X, суперник: ${secondPlayer.name}, виберіть звідки почати`,
          reply_markup: constants.startGameHumanX,
        },
      );

      game.firstPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    } else if (moves.length === 1) {
      const canvas = CanvasService.createDefaultCanvas([], {
        row: moves[0].row,
        col: moves[0].col,
      });

      const imageBuffer = canvas.toBuffer();

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Гра знайшлась, Ви граєте: X, суперник: ${secondPlayer.name}, ваш хід`,
          reply_markup: constants.gameBoardHuman,
        },
      );
      game.firstPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    } else if (
      moves.length > 1 &&
      moves[moves.length - 1].figure === 'X' &&
      !moves[moves.length - 1].innerRow &&
      !moves[moves.length - 1].innerCol
    ) {
      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: moves[moves.length - 1].row,
          col: moves[moves.length - 1].col,
        },
        moves[moves.length - 2],
      );

      const imageBuffer = canvas.toBuffer();

      const reply_markup = await GameService.getFilledReplyMarkupHuman(
        id,
        moves[moves.length - 1].row,
        moves[moves.length - 1].col,
      );

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Ви граєте: X, суперник: ${secondPlayer.name}, ваш хід`,
          reply_markup,
        },
      );

      game.firstPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    } else if (
      moves.length > 1 &&
      moves[moves.length - 1].figure === '0' &&
      moves[moves.length - 1].innerRow &&
      moves[moves.length - 1].innerCol
    ) {
      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: moves[moves.length - 1].row,
          col: moves[moves.length - 1].col,
        },
        moves[moves.length - 1],
      );

      const imageBuffer = canvas.toBuffer();

      const reply_markup = UserService.getEmptyPointsHuman(moves);

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Ви граєте: X, суперник: ${secondPlayer.name}, ваш хід, виберіть інше поле:`,
          reply_markup,
        },
      );

      game.firstPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    } else if (
      moves.length > 1 &&
      moves[moves.length - 1].figure === '0' &&
      !moves[moves.length - 1].innerRow &&
      !moves[moves.length - 1].innerCol
    ) {
      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: moves[moves.length - 1].row,
          col: moves[moves.length - 1].col,
        },
        moves[moves.length - 2],
      );

      const imageBuffer = canvas.toBuffer();

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Ви граєте: X, суперник: ${secondPlayer.name}, хід суперника`,
        },
      );

      game.firstPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    }
  } else if (figure === '0' && currentPlayer.id === secondPlayer.id) {
    if (moves.length === 0) {
      return await ctx.reply(
        `Гра знайшлася, ви граєте 0, суперник: ${firstPlayer.name}, зачекайте поки суперник зробить свій хід 🕦`,
      );
    } else if (moves.length === 1) {
      const canvas = CanvasService.createDefaultCanvas([], {
        row: moves[0].row,
        col: moves[0].col,
      });

      const imageBuffer = canvas.toBuffer();

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Гра знайшлась, Ви граєте: 0, суперник: ${firstPlayer.name}, хід суперника`,
        },
      );
      game.secondPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    } else if (
      moves.length > 1 &&
      moves[moves.length - 1].figure === '0' &&
      !moves[moves.length - 1].innerRow &&
      !moves[moves.length - 1].innerCol
    ) {
      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: moves[moves.length - 1].row,
          col: moves[moves.length - 1].col,
        },
        moves[moves.length - 2],
      );

      const imageBuffer = canvas.toBuffer();

      const reply_markup = await GameService.getFilledReplyMarkupHuman(
        id,
        moves[moves.length - 1].row,
        moves[moves.length - 1].col,
      );

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Ви граєте: 0, суперник: ${firstPlayer.name}, ваш хід`,
          reply_markup,
        },
      );

      game.secondPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    } else if (
      moves.length > 1 &&
      moves[moves.length - 1].figure === 'X' &&
      moves[moves.length - 1].innerRow &&
      moves[moves.length - 1].innerCol
    ) {
      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: moves[moves.length - 1].row,
          col: moves[moves.length - 1].col,
        },
        moves[moves.length - 1],
      );

      const imageBuffer = canvas.toBuffer();

      const reply_markup = UserService.getEmptyPointsHuman(moves);

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Ви граєте: 0, суперник: ${firstPlayer.name}, ваш хід, виберіть інше поле:`,
          reply_markup,
        },
      );

      game.secondPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    } else if (
      moves.length > 1 &&
      moves[moves.length - 1].figure === 'X' &&
      !moves[moves.length - 1].innerRow &&
      !moves[moves.length - 1].innerCol
    ) {
      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: moves[moves.length - 1].row,
          col: moves[moves.length - 1].col,
        },
        moves[moves.length - 2],
      );

      const imageBuffer = canvas.toBuffer();

      const replyMessage = await ctx.replyWithPhoto(
        { source: imageBuffer },
        {
          caption: `Ви граєте: 0, суперник: ${firstPlayer.name}, хід суперника`,
        },
      );

      game.secondPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    }
  }
});

bot.hears('Почати гру', async (ctx) => {
  const id = ctx.update.message.from.id;
  const isBot = await UserService.isBotGameType(id);
  if (isBot) {
    ctx.reply('Виберіть чим будете грати.', {
      reply_markup: { remove_keyboard: true },
    });
    return ctx.reply(`Варіанти:`, constants.startPlayWithBotMarkup);
  }

  if (!isBot) {
    const { status, game } = await UserService.getStatusPending(id);
    if (status === 'pending') {
      await ctx.reply('💬', { reply_markup: { remove_keyboard: true } });
      const replyMessage = await ctx.reply('Очікуйте початку гри', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Зупинити пошук', callback_data: 'stopSearch' }],
          ],
        },
      });
      game.firstPlayerMessageId = replyMessage.message_id;
      await game.save();
      return replyMessage;
    } else {
      await ctx.telegram.deleteMessage(
        game.firstPlayer,
        game.firstPlayerMessageId,
      );

      const canvas = CanvasService.createDefaultCanvas();

      const imageBuffer = canvas.toBuffer();

      await ctx.deleteMessage();

      const secondPlayer = await User.findOne({ id: game.secondPlayer });
      const firstPlayer = await User.findOne({ id: game.firstPlayer });

      const firstPlayerReplyMessage = await ctx.telegram.sendPhoto(
        game.firstPlayer,
        { source: imageBuffer },
        {
          caption: `Гра знайшлась, Ви граєте: X, суперник: ${secondPlayer.name}, виберіть звідки почати`,
          reply_markup: constants.startGameHumanX,
        },
      );

      const secondPlayerReplyMessage = await ctx.telegram.sendMessage(
        game.secondPlayer,
        `Гра знайшлася, ви граєте 0, суперник: ${firstPlayer.name}, зачекайте поки суперник зробить свій хід 🕦`,
        {
          reply_markup: { remove_keyboard: true },
        },
      );

      game.firstPlayerMessageId = firstPlayerReplyMessage.message_id;
      game.secondPlayerMessageId = secondPlayerReplyMessage.message_id;

      await game.save();

      return secondPlayerReplyMessage;
    }
  }
});

bot.action('startGameHumanXbtn1', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 0, 0);
});
bot.action('startGameHumanXbtn2', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 0, 1);
});
bot.action('startGameHumanXbtn3', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 0, 2);
});
bot.action('startGameHumanXbtn4', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 1, 0);
});
bot.action('startGameHumanXbtn5', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 1, 1);
});
bot.action('startGameHumanXbtn6', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 1, 2);
});
bot.action('startGameHumanXbtn7', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 2, 0);
});
bot.action('startGameHumanXbtn8', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 2, 1);
});
bot.action('startGameHumanXbtn9', async (ctx) => {
  return UserService.startGameHumanXbtn1(ctx, 2, 2);
});

bot.action('gameBoardHuman1', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 0, 0);
});
bot.action('gameBoardHuman2', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 0, 1);
});
bot.action('gameBoardHuman3', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 0, 2);
});
bot.action('gameBoardHuman4', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 1, 0);
});
bot.action('gameBoardHuman5', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 1, 1);
});
bot.action('gameBoardHuman6', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 1, 2);
});
bot.action('gameBoardHuman7', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 2, 0);
});
bot.action('gameBoardHuman8', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 2, 1);
});
bot.action('gameBoardHuman9', async (ctx) => {
  return await UserService.gameBoardHuman(ctx, 2, 2);
});

bot.action('chooseAgainHuman1', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 0, 0);
});
bot.action('chooseAgainHuman2', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 0, 1);
});
bot.action('chooseAgainHuman3', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 0, 2);
});
bot.action('chooseAgainHuman4', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 1, 0);
});
bot.action('chooseAgainHuman5', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 1, 1);
});
bot.action('chooseAgainHuman6', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 1, 2);
});
bot.action('chooseAgainHuman7', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 2, 0);
});
bot.action('chooseAgainHuman8', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 2, 1);
});
bot.action('chooseAgainHuman9', async (ctx) => {
  return UserService.chooseAgainHuman(ctx, 2, 2);
});

bot.hears('Змінити тип гри', (ctx) => {
  return ctx.reply(
    `Виберіть з ким ви будете грати:`,
    constants.startBotReplyMarkup,
  );
});

bot.action('stopSearch', async (ctx) => {
  await ctx.deleteMessage();

  const user = await User.findOne({ status: 'pending' });
  const game = await Game.findOne({
    status: 'pending',
    firstPlayer: user.id,
  });

  await Game.deleteOne(game._id);
  user.status = 'active';
  await user.save();
  return await ctx.reply('Ви призупинили пошук', {
    reply_markup: constants.startGameKeyboard,
  });
});

bot.action('human', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await UserService.updateGameType(id, 'human');

  await ctx.deleteMessage();

  return ctx.reply('Ви вибрали грати з вами подібними, до бою!', {
    reply_markup: constants.startGameKeyboard,
  });
});

bot.action('bot', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await UserService.updateGameType(id, 'bot');

  await ctx.deleteMessage();

  return ctx.reply('Ви вибрали грати з ботом', {
    reply_markup: constants.startGameKeyboard,
  });
});

bot.action('cross', async (ctx) => {
  const canvas = CanvasService.createDefaultCanvas();

  const imageBuffer = canvas.toBuffer();

  await ctx.deleteMessage();

  return await ctx.replyWithPhoto(
    { source: imageBuffer },
    {
      caption: 'Ви граєте: X, виберіть звідки почати',
      reply_markup: constants.startGameBotX,
    },
  );
});

bot.action('zero', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await ctx.deleteMessage();

  await GameService.createBotGame(id, '0', '1');

  const moves = await GameService.getMovesList(id);

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: moves[0].innerRow, col: moves[0].innerCol },
    moves[0],
  );

  const imageBuffer = canvas.toBuffer();

  return await ctx.replyWithPhoto(
    { source: imageBuffer },
    { caption: 'Ви граєте: 0', reply_markup: constants.gameBoard },
  );
});

bot.action('startGameBot0btn1', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, '0', '1');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 0, col: 0 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: 0',
    },

    { reply_markup: constants.gameBoard },
  );
});

bot.action('startGameBotXbtn1', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '1');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 0, col: 0 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});
bot.action('startGameBotXbtn2', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '2');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 0, col: 1 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});
bot.action('startGameBotXbtn3', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '3');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 0, col: 2 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});
bot.action('startGameBotXbtn4', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '4');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 1, col: 0 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});
bot.action('startGameBotXbtn5', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '5');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 1, col: 1 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});
bot.action('startGameBotXbtn6', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '6');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 1, col: 2 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});
bot.action('startGameBotXbtn7', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '7');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 2, col: 0 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});
bot.action('startGameBotXbtn8', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '8');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 2, col: 1 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});
bot.action('startGameBotXbtn9', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await GameService.createBotGame(id, 'X', '9');

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const canvas = CanvasService.createDefaultCanvas([], { row: 2, col: 2 });

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: 'Ви граєте: X',
    },

    { reply_markup: constants.gameBoard },
  );
});

bot.action('gameBoardbtn1', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 0;
  const innerCol = 0;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }

  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('gameBoardbtn2', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 0;
  const innerCol = 1;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }

  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('gameBoardbtn3', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 0;
  const innerCol = 2;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }

  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('gameBoardbtn4', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 1;
  const innerCol = 0;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }

  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('gameBoardbtn5', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 1;
  const innerCol = 1;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }

  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('gameBoardbtn6', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 1;
  const innerCol = 2;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }

  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('gameBoardbtn7', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 2;
  const innerCol = 0;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }
  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('gameBoardbtn8', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 2;
  const innerCol = 1;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }

  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('gameBoardbtn9', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const innerRow = 2;
  const innerCol = 2;

  const { moves, nextCol, nextRow, message } = await GameService.getMoves(
    id,
    innerRow,
    innerCol,
  );

  const botMove = moves[moves.length - 2];

  const type = await GameService.getTypeFigure(id);

  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (message) {
    if (message === 'Виберіть інше поле') {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      return await ctx.telegram.editMessageMedia(
        chatId,
        messageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${type}, ${message}`,
        },

        { reply_markup: GameService.getEmptyPoints(moves) },
      );
    } else if (message.includes('Гра закінчилась')) {
      const myMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        { row: nextRow, col: nextCol },
        myMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.reply(message.split(',')[1], {
        reply_markup: constants.startGameKeyboard,
      });

      return await ctx.telegram.editMessageMedia(chatId, messageId, null, {
        type: 'photo',
        media: { source: imageBuffer },
        caption: message.split(',')[0],
      });
    }
  }

  const reply_markup = await GameService.getFilledReplyMarkup(
    id,
    nextRow,
    nextCol,
  );

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row: nextRow, col: nextCol },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}; Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});

bot.action('chooseAgain1', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 0;
  const col = 0;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '1', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});
bot.action('chooseAgain2', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 0;
  const col = 1;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '2', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});
bot.action('chooseAgain3', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 0;
  const col = 2;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '3', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});
bot.action('chooseAgain4', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 1;
  const col = 0;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '4', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});
bot.action('chooseAgain5', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 1;
  const col = 1;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '5', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});
bot.action('chooseAgain6', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 1;
  const col = 2;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '6', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});
bot.action('chooseAgain7', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 2;
  const col = 0;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '7', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});
bot.action('chooseAgain8', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 2;
  const col = 1;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '8', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },

    { reply_markup },
  );
});
bot.action('chooseAgain9', async (ctx) => {
  const id = ctx.update.callback_query.from.id;
  const row = 2;
  const col = 2;
  const chatId = ctx.update.callback_query.message.chat.id;
  const messageId = ctx.update.callback_query.message.message_id;
  const type = await GameService.getTypeFigure(id);

  const moves = await GameService.addMove(id, '9', type);

  const botMove = moves[moves.length - 1];

  const canvas = CanvasService.createDefaultCanvas(
    moves,
    { row, col },
    botMove,
  );

  const imageBuffer = canvas.toBuffer();

  const reply_markup = await GameService.getFilledReplyMarkup(id, row, col);

  return await ctx.telegram.editMessageMedia(
    chatId,
    messageId,
    null,
    {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${type}, Хід бота: ${botMove.row} ${botMove.col} ${botMove.innerRow} ${botMove.innerCol}`,
    },
    { reply_markup },
  );
});

bot.launch().then();

app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());

app.use(cors());

app.use('/auth', require('./routes/auth.routes'));
app.use('/game', require('./routes/game.routes'));
app.use('/user', require('./routes/user.routes'));

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || ''),
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`App has been started on PORT ${PORT}`));
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

start().then();
