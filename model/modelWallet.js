const mongoose = require('mongoose');

const WalletUserModel = mongoose.model('WalletUsers', {
  id: Number,
  del: {
    address: String,
    mnemonics: String
  }
});

module.exports = WalletUserModel
