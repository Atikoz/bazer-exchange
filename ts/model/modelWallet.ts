import mongoose, { Document, Schema, Model } from 'mongoose';

interface IWalletUser extends Document {
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
  },
  minter: {
    address: String,
    privateKey: String
  }
}

const WalletUserSchema: Schema<IWalletUser> = new Schema({
  id: { type: Number, required: true },
  mnemonics: { type: String, required: true },
  del: {
    address: { type: String, required: true },
    mnemonics: { type: String, required: true },
  },
  usdt: {
    address: { type: String, required: true },
    privateKey: { type: String, required: true }
  },
  minePlex: {
    address: { type: String, required: true },
    sk: { type: String, required: true },
    pk: { type: String, required: true }
  },
  mpxXfi: {
    address: { type: String, required: true }
  },
  artery: {
    address: { type: String, required: true }
  },
  minter: {
    address: { type: String, required: true },
    privateKey: { type: String, required: true }
  }
});

const WalletUserModel: Model<IWalletUser> = mongoose.model<IWalletUser>('WalletUsers', WalletUserSchema);

export default WalletUserModel;