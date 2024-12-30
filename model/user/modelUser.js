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
    required: true,
    default: null
  },
  lang: {
    type: String,
    default: 'eng'
  }
});

module.exports = UserModel;