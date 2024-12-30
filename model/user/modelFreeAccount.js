const mongoose = require('mongoose');

const FreeAccountModel = mongoose.model('free-account', {
  busy: {
    type: Boolean,
    required: true
  },
  mnemonic: {
    type: String,
    required: true,
    unique: true
  },
  del: {
    address: {
      type: String,
      required: true,
      unique: true
    }
  },
  usdt: {
    address: {
      type: String,
      required: true,
      unique: true
    },
    privateKey: {
      type: String,
      required: true,
      unique: true
    },
  },
  crossfi: {
    address: {
      type: String,
      required: true,
      unique: true
    },
  },
  artery: {
    address: {
      type: String,
      required: true,
      unique: true
    },
  },
  minter: {
    address: {
      type: String,
      required: true,
      unique: true
    },
    privateKey: {
      type: String,
      required: true,
      unique: true
    },
  }
});

module.exports = FreeAccountModel;