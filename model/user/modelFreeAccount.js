const mongoose = require('mongoose');

const FreeAccountModel = mongoose.model('free-account', {
  busy: Boolean,
  mnemonic: String,
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
  },
  minter: {
    address: String,
    privateKey: String
  }
});

module.exports = FreeAccountModel;