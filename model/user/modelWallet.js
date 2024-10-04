const mongoose = require('mongoose');

const WalletUserModel = mongoose.model('WalletUsers', {
  id: Number,
  mnemonics: String,
  del: {
    address: String,
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
  },
  minter: {
    address: String,
    privateKey: String
  }

});

module.exports = WalletUserModel
