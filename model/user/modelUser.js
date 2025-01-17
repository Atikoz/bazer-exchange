const mongoose = require('mongoose');

const UserModel = mongoose.model('Users', {
  id: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: Number,
    default: 0
  },

  mail: {
    type: String,
    default: null
  },

  lang: {
    type: String,
    default: 'eng'
  },

  referrer: {
    type: Number,
    required: true,
    index: true
  },

  referrer2: {
    type: Number,
    required: true,
    index: true
  },

  referrer3: {
    type: Number,
    required: true,
    index: true
  }
});

module.exports = UserModel;