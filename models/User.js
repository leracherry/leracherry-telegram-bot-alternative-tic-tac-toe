const { Schema, model } = require('mongoose');

const schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
  },
  gameType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

module.exports = model('User', schema);
