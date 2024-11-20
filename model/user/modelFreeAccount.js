const mongoose = require('mongoose');

const FreeAccountModel = mongoose.model('free-account', {
  busy: {
    type: Boolean,
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
    privateKey: {
      type: String,
      required: true
    },
  },
  crossfi: {
    address: {
      type: String,
      required: true
    },
  },
  artery: {
    address: {
      type: String,
      required: true
    },
  },
  minter: {
    address: {
      type: String,
      required: true
    },
    privateKey: {
      type: String,
      required: true
    },
  }
});

module.exports = FreeAccountModel;