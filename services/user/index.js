const User = require('../../models/User');
const Game = require('../../models/Game');
const GameService = require('../game');
const CanvasService = require('../canvas');
const constants = require('../../common/constants');
const Chance = require('chance');
const chance = new Chance();

class UserService {
  async checkNewUser(id, ctx) {
    const candidate = await User.findOne({ id });
    if (!candidate) {
      const firstName = !!ctx.message.from.first_name
        ? ctx.message.from.first_name
        : chance.name();

      const user = new User({
        id,
        name: firstName,
        role: 'user',
        gameType: 'bot',
        createdAt: new Date(),
        status: 'active',
      });

      await user.save();
    }

    const currentUser = await User.findOne({ id });

    return currentUser.status;
  }

  async updateGameType(id, gameType) {
    const user = await User.findOne({ id });
    if (!user) {
      throw new Error('User not found');
    }
    user.gameType = gameType;
    await user.save();
  }

  async isBotGameType(id) {
    const user = await User.findOne({ id });
    if (!user) {
      throw new Error('User not found');
    }

    return user.gameType === 'bot';
  }

  async getStatusPending(id) {
    const user = await User.findOne({ id });
    if (!user) {
      throw new Error('User not found');
    }
    const otherPlayer = await User.findOne({ status: 'pending' });
    const createdGame = await Game.findOne({
      status: 'pending',
      firstPlayer: otherPlayer?.id ?? 'id',
    });
    if (otherPlayer && createdGame) {
      otherPlayer.status = 'playing';
      user.status = 'playing';
      createdGame.status = 'started';
      createdGame.secondPlayer = user.id;

      await otherPlayer.save();
      await user.save();
      await createdGame.save();

      return { status: 'playing', game: createdGame };
    } else {
      const game = await GameService.createNewGame(id);

      user.status = 'pending';
      await user.save();
      return { status: 'pending', game };
    }
  }

  async startGameHumanXbtn1(ctx, row, col) {
    const id = ctx.chat.id.toString();

    const game = await Game.findOne({
      firstPlayer: id,
      status: 'started',
      gameType: 'human',
    });

    const firstPlayer = await User.findOne({ id });
    const secondPlayer = await User.findOne({ id: game.secondPlayer });

    game.moves = [{ row, col, figure: 'X' }];

    await game.save();

    const canvas = CanvasService.createDefaultCanvas([], { row, col });

    const imageBuffer = canvas.toBuffer();

    // send to second player

    await ctx.deleteMessage();

    const secondPlayerReplyMessage = await ctx.telegram.sendPhoto(
      game.secondPlayer,
      { source: imageBuffer },
      {
        caption: `Ви граєте: 0, суперник: ${firstPlayer.name}, хід суперника`,
      },
    );

    const firstPlayerReplyMessage = await ctx.telegram.sendPhoto(
      game.firstPlayer,
      { source: imageBuffer },
      {
        caption: `Ви граєте: X, суперник: ${secondPlayer.name}, ваш хід`,
        reply_markup: constants.gameBoardHuman,
      },
    );

    game.firstPlayerMessageId = firstPlayerReplyMessage.message_id;
    game.secondPlayerMessageId = secondPlayerReplyMessage.message_id;

    await game.save();
  }

  async gameBoardHuman(ctx, innerRow, innerCol) {
    // необходимо найти чей сейчас ход
    const id = ctx.chat.id.toString();

    const game = await Game.findOne({
      $or: [{ firstPlayer: id }, { secondPlayer: id }],
      status: 'started',
      gameType: 'human',
    });

    const firstPlayer = await User.findOne({ id: game.firstPlayer });
    const secondPlayer = await User.findOne({ id: game.secondPlayer });

    const currentPlayer = firstPlayer.id === id ? firstPlayer : secondPlayer;

    const currentMessageId =
      game.firstPlayer === id
        ? game.firstPlayerMessageId
        : game.secondPlayerMessageId;

    const otherPlayer = firstPlayer.id === id ? secondPlayer : firstPlayer;

    const otherMessageId =
      game.firstPlayer === id
        ? game.secondPlayerMessageId
        : game.firstPlayerMessageId;

    const figure = firstPlayer.id === id ? 'X' : '0';
    const otherFigure = firstPlayer.id === id ? '0' : 'X';

    // необходимо сделать ход

    const moves = game.moves;
    moves[moves.length - 1] = {
      ...moves[moves.length - 1],
      innerRow,
      innerCol,
    };

    // после хода делаем проверку на победителя

    const isGameWinner = GameService.isGameWinner(moves, figure);

    if (isGameWinner) {
      // если победил текущий игрок, завершаем игру, пишем ему, что он победил

      game.moves = moves;
      game.status = 'ended';
      game.winner = currentPlayer.id;
      await game.save();

      firstPlayer.status = 'active';
      secondPlayer.status = 'active';

      await firstPlayer.save();
      await secondPlayer.save();

      const lastMove = game.moves[game.moves - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: innerRow,
          col: innerCol,
        },
        lastMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.telegram.editMessageMedia(
        otherPlayer.id,
        otherMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
        },
      );

      await ctx.telegram.sendMessage(
        otherPlayer.id,
        'Гра закінчилась, Ви програли',
        {
          reply_markup: constants.startGameKeyboard,
        },
      );

      await ctx.telegram.editMessageMedia(
        currentPlayer.id,
        currentMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
        },
      );
      return await ctx.reply('Гра закінчилась, Ви виграли', {
        reply_markup: constants.startGameKeyboard,
      });
    }

    if (moves.length === 81) {
      // если ничья, завершаем игру и выдаём ничью

      game.moves = moves;
      game.status = 'ended';
      game.winner = 'draw';
      await game.save();

      firstPlayer.status = 'active';
      secondPlayer.status = 'active';

      await firstPlayer.save();
      await secondPlayer.save();

      const lastMove = game.moves[game.moves - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: innerRow,
          col: innerCol,
        },
        lastMove,
      );

      const imageBuffer = canvas.toBuffer();

      await ctx.telegram.editMessageMedia(
        otherPlayer.id,
        otherMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
        },
      );

      await ctx.telegram.sendMessage(otherPlayer.id, 'Гра закінчилась, Нічия', {
        reply_markup: constants.startGameKeyboard,
      });

      await ctx.telegram.editMessageMedia(
        currentPlayer.id,
        currentMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
        },
      );

      return await ctx.reply('Гра закінчилась, Нічия', {
        reply_markup: constants.startGameKeyboard,
      });
    }

    // добавляем следующий ход

    // если человека перебросило в заполненную ячейку, то предложить ему выбор пустых ячеек

    if (
      moves.filter((item) => item.row === innerRow && item.col === innerCol)
        .length === 9 &&
      moves.length < 81
    ) {
      const lastMove = moves[moves.length - 1];

      const canvas = CanvasService.createDefaultCanvas(
        moves,
        {
          row: lastMove.innerRow,
          col: lastMove.innerCol,
        },
        lastMove,
      );

      game.moves = moves;
      await game.save();

      const imageBuffer = canvas.toBuffer();

      const reply_markup = this.getEmptyPointsHuman(moves);

      await ctx.telegram.editMessageMedia(
        otherPlayer.id,
        otherMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${otherFigure}, суперник: ${currentPlayer.name}, ваш хід, виберіть інше поле:`,
        },
        { reply_markup },
      );

      return await ctx.telegram.editMessageMedia(
        currentPlayer.id,
        currentMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Ви граєте: ${figure}, суперник: ${otherPlayer.name}, хід суперника`,
        },
      );
    }

    const lastMove = game.moves[game.moves - 1];

    moves.push({
      row: innerRow,
      col: innerCol,
      figure: figure === 'X' ? '0' : 'X',
    });

    game.moves = moves;
    await game.save();

    const canvas = CanvasService.createDefaultCanvas(
      moves,
      {
        row: innerRow,
        col: innerCol,
      },
      lastMove,
    );

    const imageBuffer = canvas.toBuffer();

    const reply_markup = await GameService.getFilledReplyMarkupHuman(
      id,
      innerRow,
      innerCol,
    );

    await ctx.telegram.editMessageMedia(
      otherPlayer.id,
      otherMessageId,
      null,
      {
        type: 'photo',
        media: { source: imageBuffer },
        caption: `Ви граєте: ${otherFigure}, суперник: ${currentPlayer.name}, ваш хід`,
      },
      { reply_markup },
    );

    return await ctx.telegram.editMessageMedia(
      currentPlayer.id,
      currentMessageId,
      null,
      {
        type: 'photo',
        media: { source: imageBuffer },
        caption: `Ви граєте: ${figure}, суперник: ${otherPlayer.name}, хід суперника`,
      },
    );
  }

  getEmptyPointsHuman(moves) {
    const emptyMoves = [];

    const innerItems = [
      { row: 0, col: 0, index: '1' },
      { row: 0, col: 1, index: '2' },
      { row: 0, col: 2, index: '3' },
      { row: 1, col: 0, index: '4' },
      { row: 1, col: 1, index: '5' },
      { row: 1, col: 2, index: '6' },
      { row: 2, col: 0, index: '7' },
      { row: 2, col: 1, index: '8' },
      { row: 2, col: 2, index: '9' },
    ];

    for (let i = 0; i < innerItems.length; i++) {
      let candidateMoves = moves.filter(
        (item) =>
          item.row === innerItems[i].row && item.col === innerItems[i].col,
      );

      if (candidateMoves.length < 9) {
        emptyMoves.push(innerItems[i].index);
      }
    }

    const inline_keyboard = [];
    let row = [];

    emptyMoves.forEach((button) => {
      row.push({ text: button, callback_data: `chooseAgainHuman${button}` }); // Добавление кнопки в текущую строку
      if (row.length === 3) {
        // Если в строке уже 3 кнопки
        inline_keyboard.push(row); // Добавить строку в `inline_keyboard`
        row = []; // Создать новую пустую строку
      }
    });

    if (row.length > 0) {
      inline_keyboard.push(row);
    }

    return {
      inline_keyboard: inline_keyboard,
    };
  }

  async chooseAgainHuman(ctx, row, col) {
    const id = ctx.chat.id.toString();

    const game = await Game.findOne({
      $or: [{ firstPlayer: id }, { secondPlayer: id }],
      status: 'started',
      gameType: 'human',
    });

    const firstPlayer = await User.findOne({ id: game.firstPlayer });
    const secondPlayer = await User.findOne({ id: game.secondPlayer });

    const currentPlayer = firstPlayer.id === id ? firstPlayer : secondPlayer;

    const currentMessageId =
      game.firstPlayer === id
        ? game.firstPlayerMessageId
        : game.secondPlayerMessageId;

    const otherPlayer = firstPlayer.id === id ? secondPlayer : firstPlayer;

    const otherMessageId =
      game.firstPlayer === id
        ? game.secondPlayerMessageId
        : game.firstPlayerMessageId;

    const figure = firstPlayer.id === id ? 'X' : '0';
    const otherFigure = firstPlayer.id === id ? '0' : 'X';

    // добавляем этот ход

    const moves = game.moves;
    moves.push({ row, col, figure });

    game.moves = moves;

    await game.save();

    const lastMove = game.moves[game.moves - 1];

    const canvas = CanvasService.createDefaultCanvas(
      moves,
      { row, col },
      lastMove,
    );

    const imageBuffer = canvas.toBuffer();

    const reply_markup = await GameService.getFilledReplyMarkupHuman(
      id,
      row,
      col,
    );

    await ctx.telegram.editMessageMedia(otherPlayer.id, otherMessageId, null, {
      type: 'photo',
      media: { source: imageBuffer },
      caption: `Ви граєте: ${otherFigure}, суперник: ${currentPlayer.name}, хід суперника`,
    });

    return await ctx.telegram.editMessageMedia(
      currentPlayer.id,
      currentMessageId,
      null,
      {
        type: 'photo',
        media: { source: imageBuffer },
        caption: `Ви граєте: ${figure}, суперник: ${otherPlayer.name}, ваш хід`,
      },
      { reply_markup },
    );
  }
}

module.exports = new UserService();
