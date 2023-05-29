module.exports = {
  startBotReplyMarkup: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Людина',
            callback_data: 'human',
          },
          {
            text: 'Бот',
            callback_data: 'bot',
          },
        ],
      ],
    },
  },
  startPlayWithBotMarkup: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'X',
            callback_data: 'cross',
          },
          {
            text: '0',
            callback_data: 'zero',
          },
        ],
      ],
    },
  },

  gameBoard: {
    inline_keyboard: [
      [
        {
          text: ' ',
          callback_data: 'gameBoardbtn1',
        },
        {
          text: ' ',
          callback_data: 'gameBoardbtn2',
        },
        {
          text: ' ',
          callback_data: 'gameBoardbtn3',
        },
      ],
      [
        {
          text: ' ',
          callback_data: 'gameBoardbtn4',
        },
        {
          text: ' ',
          callback_data: 'gameBoardbtn5',
        },
        {
          text: ' ',
          callback_data: 'gameBoardbtn6',
        },
      ],
      [
        {
          text: ' ',
          callback_data: 'gameBoardbtn7',
        },
        {
          text: ' ',
          callback_data: 'gameBoardbtn8',
        },
        {
          text: ' ',
          callback_data: 'gameBoardbtn9',
        },
      ],
    ],
  },
  gameBoardHuman: {
    inline_keyboard: [
      [
        {
          text: ' ',
          callback_data: 'gameBoardHuman1',
        },
        {
          text: ' ',
          callback_data: 'gameBoardHuman2',
        },
        {
          text: ' ',
          callback_data: 'gameBoardHuman3',
        },
      ],
      [
        {
          text: ' ',
          callback_data: 'gameBoardHuman4',
        },
        {
          text: ' ',
          callback_data: 'gameBoardHuman5',
        },
        {
          text: ' ',
          callback_data: 'gameBoardHuman6',
        },
      ],
      [
        {
          text: ' ',
          callback_data: 'gameBoardHuman7',
        },
        {
          text: ' ',
          callback_data: 'gameBoardHuman8',
        },
        {
          text: ' ',
          callback_data: 'gameBoardHuman9',
        },
      ],
    ],
  },
  startGameBotX: {
    inline_keyboard: [
      [
        {
          text: '1',
          callback_data: 'startGameBotXbtn1',
        },
        {
          text: '2',
          callback_data: 'startGameBotXbtn2',
        },
        {
          text: '3',
          callback_data: 'startGameBotXbtn3',
        },
      ],
      [
        {
          text: '4',
          callback_data: 'startGameBotXbtn4',
        },
        {
          text: '5',
          callback_data: 'startGameBotXbtn5',
        },
        {
          text: '6',
          callback_data: 'startGameBotXbtn6',
        },
      ],
      [
        {
          text: '7',
          callback_data: 'startGameBotXbtn7',
        },
        {
          text: '8',
          callback_data: 'startGameBotXbtn8',
        },
        {
          text: '9',
          callback_data: 'startGameBotXbtn9',
        },
      ],
    ],
  },
  startGameHumanX: {
    inline_keyboard: [
      [
        {
          text: '1',
          callback_data: 'startGameHumanXbtn1',
        },
        {
          text: '2',
          callback_data: 'startGameHumanXbtn2',
        },
        {
          text: '3',
          callback_data: 'startGameHumanXbtn3',
        },
      ],
      [
        {
          text: '4',
          callback_data: 'startGameHumanXbtn4',
        },
        {
          text: '5',
          callback_data: 'startGameHumanXbtn5',
        },
        {
          text: '6',
          callback_data: 'startGameHumanXbtn6',
        },
      ],
      [
        {
          text: '7',
          callback_data: 'startGameHumanXbtn7',
        },
        {
          text: '8',
          callback_data: 'startGameHumanXbtn8',
        },
        {
          text: '9',
          callback_data: 'startGameHumanXbtn9',
        },
      ],
    ],
  },
  startGameKeyboard: {
    keyboard: [[{ text: 'Почати гру' }, { text: 'Змінити тип гри' }]],
    resize_keyboard: true,
    remove_keyboard: true,
  },
};
