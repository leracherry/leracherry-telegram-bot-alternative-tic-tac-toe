const {Schema, model} = require('mongoose')

const schema = new Schema({
    firstPlayer: {
        type: String,
        required: true
    },
    secondPlayer: {
        type: String,
        required: true
    },

    gameType: {
        type: String,
        required: true
    },
    moves: {
        type: Array,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    winner: {
      type: String,
      required: false
    },
    createdAt: {
        type: Date,
        required: true
    }
})

module.exports = model('Game', schema)