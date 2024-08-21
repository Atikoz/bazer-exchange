const mongoose = require('mongoose');

const UserModel = mongoose.model('Users', {
  id: String,
  status: Number,
  mail: String,
  lang: String
});

module.exports = UserModel;