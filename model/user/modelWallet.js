const mongoose = require('mongoose');

const WalletUserModel = mongoose.model('WalletUsers', {
  id: {
    type: Number,
    required: true
  },
  mnemonic: {
    type: String,
    required: true
  },
  del: {
    address: {
      type: String,
      required: true
    }
  },
  usdt: {
    address: {
      type: String,
      required: true
    },
    privateKey: String
  },
  crossfi: {
    address: {
      type: String,
      required: true
    }
  },
  artery: {
    address: {
      type: String,
      required: true
    }
  },
  minter: {
    address: {
      type: String,
      required: true
    },
    privateKey: {
      type: String,
      required: true
    }
  }

});

module.exports = WalletUserModel
