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
            moves: type === 'X' ? this.getMove(item, type) : await this.getBotFirstMove()
        })

        await game.save()
    }

    async getBotFirstMove(){
        const {row, col} = await this.getBotMove([], 'X')
        return [{
            row: Math.floor(Math.random() * 3),
            col: Math.floor(Math.random() * 3),
            figure: 'X',
            innerRow: row,
            innerCol: col
        }, {row, col, figure: '0'}]
    }

    getMove(item, type) {
        switch (item) {
            case '1':
                return [{row: 0, col: 0, figure: type}]
            case '2':
                return [{row: 0, col: 1, figure: type}]
            case '3':
                return [{row: 0, col: 2, figure: type}]
            case '4':
                return [{row: 1, col: 0, figure: type}]
            case '5':
                return [{row: 1, col: 1, figure: type}]
            case '6':
                return [{row: 1, col: 2, figure: type}]
            case '7':
                return [{row: 2, col: 0, figure: type}]
            case '8':
                return [{row: 2, col: 1, figure: type}]
            case '9':
                return [{row: 2, col: 2, figure: type}]
        }
    }

    async addMove(id, item, type) {
        const game = await Game.findOne(
            {$or: [
                    {firstPlayer: id},
                    {secondPlayer: id}
                ],
                status: 'started'
            })
        const moves = game.moves
        moves.push(this.getMove(item, type)[0])
        game.moves = moves
        await game.save()

        return moves
    }
    isWinner(moves, figure) {
        const winningCombinations = [
            // Горизонтальные комбинации
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            // Вертикальные комбинации
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            // Диагональные комбинации
            [[0, 0], [1, 1], [2, 2]],
            [[0, 2], [1, 1], [2, 0]],
        ];

        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (
                moves.some(move => move.col === a[0] && move.row === a[1] && move.figure === figure) &&
                moves.some(move => move.col === b[0] && move.row === b[1] && move.figure === figure) &&
                moves.some(move => move.col === c[0] && move.row === c[1] && move.figure === figure)
            ) {
                return true;
            }
        }

        return false;
    }

    getBotMove(moves, figure) {

        function getAllAvailableMoves(moves) {
            const availableMoves = [];
            for (let col = 0; col < 3; col++) {
                for (let row = 0; row < 3; row++) {
                    if (!moves.some(move => move.col === col && move.row === row)) {
                        availableMoves.push({ col, row });
                    }
                }
            }
            return availableMoves;
        }
// Получаем все доступные ходы
        const availableMoves = getAllAvailableMoves(moves);

        // Перебираем доступные ходы
        for (const move of availableMoves) {
            // Создаем копию массива ходов
            const clonedMoves = [...moves];

            // Добавляем текущий ход в копию массива ходов
            clonedMoves.push({ col: move.col, row: move.row, figure: figure });

            // Проверяем, если текущий ход приводит к победе, возвращаем его
            if (this.isWinner(clonedMoves, figure)) {
                return { col: move.col, row: move.row };
            }
        }

        // Если нет выигрышных ходов, выбираем случайный доступный ход
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        return { col: randomMove.col, row: randomMove.row };
    }

    isGameWinner(moves, figure) {
        const innerItems = [
            {row: 0, col: 0},
            {row: 0, col: 1},
            {row: 0, col: 2},
            {row: 1, col: 0},
            {row: 1, col: 1},
            {row: 1, col: 2},
            {row: 2, col: 0},
            {row: 2, col: 1},
            {row: 2, col: 2},
        ]
        const squareMoves = []
        const winsList = []

        for (let i = 0; i < innerItems.length; i++) {
            const sMoves = moves.filter(item => item.row === innerItems[i].row && item.col === innerItems[i].col).map(el => {
                if(el.innerRow !== undefined && el.innerCol !== undefined) {
                    return {
                        row: el.innerRow,
                        col: el.innerCol,
                        figure: el.figure
                    }
                }
                return undefined
            }).filter(m => m !== undefined)
            squareMoves.push(sMoves)
        }

        for (let i = 0; i < squareMoves.length; i++) {
            winsList.push(this.isWinner(squareMoves[i], figure) ? 1 : 0)
        }

        const sum = winsList.reduce((acc, curr) => acc + curr, 0);

        return sum === 3

    }


    async getMoves(id, innerRow, innerCol) {

        const game = await Game.findOne(
            {$or: [
                    {firstPlayer: id},
                    {secondPlayer: id}
                ],
                status: 'started'
            })
        const moves = game.moves

        moves[moves.length - 1] = {...moves[moves.length - 1], innerRow, innerCol}

        const botFigure = game.firstPlayer === 'bot' ? 'X' : '0'

        const isGameWinner = this.isGameWinner(moves, botFigure === 'X' ? '0' : 'X')

        if(isGameWinner) {
            game.moves = moves
            game.status = 'ended'
            await game.save()
            return {message: 'Гра закінчилась, Ви виграли', moves}
        }


        if(moves.length === 81){
            game.moves = moves
            game.status = 'ended'
            await game.save()
            return {message: 'Гра закінчилась, Нічия', moves}
        }

        let movesCurrentPoint = moves.filter(item => item.row === innerRow && item.col === innerCol).map(el => {
            if(el.innerRow !== undefined && el.innerCol !== undefined) {
                return {
                    row: el.innerRow,
                    col: el.innerCol,
                    figure: el.figure
                }
            }
            return undefined
        }).filter(m => m !== undefined)

        if(movesCurrentPoint.length === 9) {
            const innerItems = [
                {row: 0, col: 0},
                {row: 0, col: 1},
                {row: 0, col: 2},
                {row: 1, col: 0},
                {row: 1, col: 1},
                {row: 1, col: 2},
                {row: 2, col: 0},
                {row: 2, col: 1},
                {row: 2, col: 2},
            ]

            let isGameEnded = true
            for (let i = 0; i < innerItems.length; i++) {
                let candidateMoves = moves.filter(item => item.row === innerItems[i].row && item.col === innerItems[i].col)

                if(candidateMoves.length < 9) {

                    innerRow = innerItems[i].row
                    innerCol = innerItems[i].col
                    movesCurrentPoint = candidateMoves.map(el => {
                        if(el.innerRow !== undefined && el.innerCol !== undefined) {
                            return {
                                row: el.innerRow,
                                col: el.innerCol,
                                figure: el.figure
                            }
                        }
                        return undefined
                    }).filter(m => m !== undefined)
                    isGameEnded = false

                    break
                }
            }

            if(isGameEnded){
                game.moves = moves
                game.status = 'ended'
                await game.save()
                return {message: 'Гра закінчилась, Нічия', moves}
            }
        }


        const {row, col} = await this.getBotMove(movesCurrentPoint, botFigure)

        moves.push({row: innerRow, col: innerCol, figure: botFigure, innerRow: row, innerCol: col})

        // добавить проверку на победителя

        const isBotWinner = this.isGameWinner(moves, botFigure)

        if(isBotWinner) {
            game.moves = moves
            game.status = 'ended'
            await game.save()
            return {message: 'Гра закінчилась, Ви програли', moves}
        }

        if(moves.filter(item => item.row === row && item.col === col).length === 9 && moves.length < 81) {
            game.moves = moves
            await game.save()

            return {message: 'Виберіть інше поле', moves, nextRow: row, nextCol: col}
        }

        moves.push({row, col, figure: botFigure === '0' ? 'X' : '0'})
        game.moves = moves
        await game.save()

        return {moves, nextRow: row, nextCol: col}
    }

    async getMovesList(id){
        const game = await Game.findOne(
            {$or: [
                    {firstPlayer: id},
                    {secondPlayer: id}
                ],
                status: 'started'
            })

        return game.moves
    }

    async getFilledMoves(id, innerRow, innerCol){
        const game = await Game.findOne(
            {$or: [
                    {firstPlayer: id},
                    {secondPlayer: id}
                ],
                status: 'started'
            })
        const moves = game.moves

        return moves.filter(item => item.row === innerRow && item.col === innerCol).map(el => {
            if (el.innerRow !== undefined && el.innerCol !== undefined) {
                return {
                    row: el.innerRow,
                    col: el.innerCol,
                    figure: el.figure
                }
            }
            return undefined
        }).filter(m => m !== undefined)
    }
    async getTypeFigure(id){
        const game = await Game.findOne(
            {$or: [
                    {firstPlayer: id},
                    {secondPlayer: id}
                ],
                status: 'started'
            })

        if(!game){
            return 'X'
        }

        return game.firstPlayer === id.toString() ? 'X' : '0'
    }

    getTextFilledMove(filledMoves, row, col) {
        const filledItem = filledMoves.find(item => item.row === row && item.col === col)
        return filledItem ? filledItem.figure : ' '
    }

    getCallbackDataFilledMove(filledMoves, row, col, index) {
        return !filledMoves.find(item => item.row === row && item.col === col)
            ? `gameBoardbtn${index}`
            : 'emptyBtn'
    }

    async getFilledReplyMarkup(id, nextRow, nextCol){
        const filledMoves = await this.getFilledMoves(id, nextRow, nextCol)

        return {
            inline_keyboard:[
                [
                    {
                        text: this.getTextFilledMove(filledMoves, 0, 0),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 0, 0, 1),
                    },
                    {
                        text: this.getTextFilledMove(filledMoves, 0, 1),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 0, 1, 2),
                    },
                    {
                        text: this.getTextFilledMove(filledMoves, 0, 2),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 0, 2, 3),
                    },
                ],
                [
                    {
                        text: this.getTextFilledMove(filledMoves, 1, 0),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 1, 0, 4),
                    },
                    {
                        text: this.getTextFilledMove(filledMoves, 1, 1),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 1, 1, 5),
                    },
                    {
                        text: this.getTextFilledMove(filledMoves, 1, 2),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 1, 2, 6),
                    },
                ],
                [
                    {
                        text: this.getTextFilledMove(filledMoves, 2, 0),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 2, 0, 7),
                    },
                    {
                        text: this.getTextFilledMove(filledMoves, 2, 1),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 2, 1, 8),
                    },
                    {
                        text: this.getTextFilledMove(filledMoves, 2, 2),
                        callback_data: this.getCallbackDataFilledMove(filledMoves, 2, 2, 9),
                    },
                ],
            ]
        }
    }

    getEmptyPoints(moves){
        const emptyMoves = []

        const innerItems = [
            {row: 0, col: 0, index: '1'},
            {row: 0, col: 1, index: '2'},
            {row: 0, col: 2, index: '3'},
            {row: 1, col: 0, index: '4'},
            {row: 1, col: 1, index: '5'},
            {row: 1, col: 2, index: '6'},
            {row: 2, col: 0, index: '7'},
            {row: 2, col: 1, index: '8'},
            {row: 2, col: 2, index: '9'},
        ]

        for (let i = 0; i < innerItems.length; i++) {
            let candidateMoves = moves.filter(item => item.row === innerItems[i].row && item.col === innerItems[i].col)

            if(candidateMoves.length < 9) {
                emptyMoves.push(innerItems[i].index)
            }
        }

        const inline_keyboard = [];
        let row = [];

        emptyMoves.forEach((button) => {
            row.push({ text: button, callback_data: `chooseAgain${button}` }); // Добавление кнопки в текущую строку
            if (row.length === 3) { // Если в строке уже 3 кнопки
                inline_keyboard.push(row); // Добавить строку в `inline_keyboard`
                row = []; // Создать новую пустую строку
            }
        });

        if (row.length > 0) {
            inline_keyboard.push(row);
        }

        return {
            inline_keyboard: inline_keyboard
        }

    }
}

module.exports = new GameService()