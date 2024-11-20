const mongoose = require('mongoose');

const WalletUserModel = mongoose.model('WalletUsers', {
  id: {
    type: Number,
    required: true
  },
  mnemonics: {
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
  minePlex: {
    address: String,
    sk: String,
    pk: String
  },
  mpxXfi: {
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
