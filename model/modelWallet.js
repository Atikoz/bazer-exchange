const mongoose = require('mongoose');

const WalletUserModel = mongoose.model('WalletUsers', {
  id: Number,
  mnemonics: String,
  del: {
    address: String,
    mnemonics: String,
  },
  usdt: {
    address: String,
    privateKey: String
  },
  minePlex: {
    address: String,
    sk: String,
    pk: String
  },
  mpxXfi: {
    address: String
  },
  artery: {
    address: String
  }

});

module.exports = WalletUserModel
