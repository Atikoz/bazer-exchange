import { model, Schema } from "mongoose";

const WalletUserSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
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
    }
  },
  crossfi: {
    address: {
      type: String,
      required: true,
      unique: true
    }
  },
  artery: {
    address: {
      type: String,
      required: true,
      unique: true
    }
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
    }
  }
});

const WalletUser = model('WalletUsers', WalletUserSchema);

export default WalletUser
