const User = require('../../models/User');
const Game = require('../../models/Game');
const GameService = require('../game');
const CanvasService = require('../canvas');
const constants = require('../../common/constants');

class Index {
  async checkNewUser(id) {
    const candidate = await User.findOne({ id });
    if (!candidate) {
      const firstName = 'ctx.message.from.first_name';

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
    const id = ctx.update.callback_query.from.id;

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

    await ctx.telegram.editMessageMedia(
      secondPlayer.id,
      game.secondPlayerMessageId,
      null,
      {
        type: 'photo',
        media: { source: imageBuffer },
        caption: `Ви граєте: 0, суперник: ${firstPlayer.name}, хід суперника`,
      },
    );

    // send to first player

    return await ctx.telegram.editMessageMedia(
      firstPlayer.id,
      game.firstPlayerMessageId,
      null,
      {
        type: 'photo',
        media: { source: imageBuffer },
        caption: `Ви граєте: X, суперник: ${secondPlayer.name}, ваш хід`,
      },

      { reply_markup: constants.gameBoardHuman },
    );
  }

  async gameBoardHuman(ctx, innerRow, innerCol) {
    // необходимо найти чей сейчас ход
    const id = ctx.update.callback_query.from.id;

    const game = await Game.findOne({
      $or: [{ firstPlayer: id }, { secondPlayer: id }],
      status: 'started',
      gameType: 'human',
    });

    const firstPlayer = await User.findOne({ id });
    const secondPlayer = await User.findOne({ id: game.secondPlayer });

    const currentPlayer =
      game.moves[game.moves.length - 1].figure === 'X'
        ? firstPlayer
        : secondPlayer;

    const currentMessageId =
      game.moves[game.moves.length - 1].figure === 'X'
        ? game.firstPlayerMessageId
        : game.secondPlayerMessageId;

    const otherPlayer =
      game.moves[game.moves.length - 1].figure === 'X'
        ? secondPlayer
        : firstPlayer;

    const otherMessageId =
      game.moves[game.moves.length - 1].figure === 'X'
        ? game.secondPlayerMessageId
        : game.firstPlayerMessageId;

    const figure = currentPlayer.id === firstPlayer.id ? 'X' : '0';
    const otherFigure = currentPlayer.id === firstPlayer.id ? '0' : 'X';

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

      const canvas = CanvasService.createDefaultCanvas(moves, {
        row: innerRow,
        col: innerCol,
      });

      const imageBuffer = canvas.toBuffer();

      await ctx.telegram.editMessageMedia(
        otherPlayer.id,
        otherMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Гра закінчилась, Ви програли`,
        },
      );

      return await ctx.telegram.editMessageMedia(
        currentPlayer.id,
        currentMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Гра закінчилась, Ви виграли`,
        },
      );
    }

    if (moves.length === 81) {
      // если ничья, завершаем игру и выдаём ничью

      game.moves = moves;
      game.status = 'ended';
      game.winner = 'draw';
      await game.save();

      const canvas = CanvasService.createDefaultCanvas(moves, {
        row: innerRow,
        col: innerCol,
      });

      const imageBuffer = canvas.toBuffer();

      await ctx.telegram.editMessageMedia(
        otherPlayer.id,
        otherMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Гра закінчилась, Нічия`,
        },
      );

      return await ctx.telegram.editMessageMedia(
        currentPlayer.id,
        currentMessageId,
        null,
        {
          type: 'photo',
          media: { source: imageBuffer },
          caption: `Гра закінчилась, Нічия`,
        },
      );
    }

    // иначе мы возвращаем текущему игроку пустые кнопки и следующему игроку кнопки для ходов

    // if (
    //     moves.filter((item) => item.row === row && item.col === col).length ===
    //     9 &&
    //     moves.length < 81
    // ) {
    //   game.moves = moves;
    //   await game.save();
    //
    //   return {
    //     message: 'Виберіть інше поле',
    //     moves,
    //     nextRow: row,
    //     nextCol: col,
    //   };
    // }

    // добавляем следующий ход

    moves.push({ row: innerRow, col: innerCol, figure });

    game.moves = moves;
    await game.save();

    const canvas = CanvasService.createDefaultCanvas(moves, {
      row: innerRow,
      col: innerCol,
    });

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
}

module.exports = new Index();
