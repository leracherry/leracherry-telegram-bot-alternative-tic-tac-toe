const {Schema, model} = require('mongoose')

const schema = new Schema({
    id: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
})

module.exports = model('DownloadStats', schema)