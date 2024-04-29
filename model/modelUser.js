const mongoose = require('mongoose');

const UserModel = mongoose.model('Users', {
  id: String,
  status: Number,
  lang: String
});

module.exports = UserModel;