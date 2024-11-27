const mongoose = require('mongoose');

const UserModel = mongoose.model('Users', {
  id: String,
  status: {
    type: Number,
    default: 0
  },
  mail: String,
  lang: {
    type: String,
    default: 'eng'
  }
});

module.exports = UserModel;