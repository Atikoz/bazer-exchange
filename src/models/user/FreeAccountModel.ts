import { model, Schema } from "mongoose";

const FreeAccountSchema = new Schema({
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

const FreeAccount = model('free-account', FreeAccountSchema)

export default FreeAccount;