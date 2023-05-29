require('dotenv').config();
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

bot.start(async (ctx) => {
  try {
    const id = ctx.message.from.id;
    const status = await UserService.checkNewUser(id);
    if (status !== 'active') {
      return ctx.reply(`Вас було заблоковано`);
    }
    return ctx.reply(
      `Виберіть з ким ви будете грати:`,
      constants.startBotReplyMarkup,
    );
  } catch (error) {}
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
  return ctx.reply('Почати гру (скоро)');
});

bot.hears('Змінити тип гри', (ctx) => {
  return ctx.reply(
    `Виберіть з ким ви будете грати:`,
    constants.startBotReplyMarkup,
  );
});

bot.action('human', async (ctx) => {
  const id = ctx.update.callback_query.from.id;

  await UserService.updateGameType(id, 'human');

  await ctx.deleteMessage();

  return ctx.reply('Ви вибрали грати с компьютером', {
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
