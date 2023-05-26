const Game = require('../../models/Game')
class GameService {
    async createBotGame(id, type, item){
        const firstPlayer = type === 'X' ? id : 'bot'
        const secondPlayer = type === '0' ? id : 'bot'
        const game = new Game({
            firstPlayer,
            secondPlayer,
            gameType: 'bot',
            status: 'started',
            createdAt: new Date(),
            moves: this.getFirstMove(item)
        })

        await game.save()
    }

    getFirstMove(item) {
        switch (item) {
            case '1':
                return [{row: 0, col: 0, figure: 'X'}]
            case '2':
                return [{row: 0, col: 1, figure: 'X'}]
            case '3':
                return [{row: 0, col: 2, figure: 'X'}]
            case '4':
                return [{row: 1, col: 0, figure: 'X'}]
            case '5':
                return [{row: 1, col: 1, figure: 'X'}]
            case '6':
                return [{row: 1, col: 2, figure: 'X'}]
            case '7':
                return [{row: 2, col: 0, figure: 'X'}]
            case '8':
                return [{row: 2, col: 1, figure: 'X'}]
            case '9':
                return [{row: 2, col: 2, figure: 'X'}]
        }
    }
}

module.exports = new GameService()