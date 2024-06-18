import mongoose, { Document, Schema, Model } from 'mongoose';

interface ITransactionMinter extends Document {
  id: String,
  hash: String,
  amount: Number,
  coin: String
}

const TransactionMinterScema: Schema<ITransactionMinter> = new Schema({
  id: { type: String, required: true },
  hash: { type: String, required: true },
  amount: { type: String, required: true },
  coin: { type: String, required: true }
});


const MinterReplenishment: Model<ITransactionMinter> = mongoose.model<ITransactionMinter>('Minter-Replenishment', TransactionMinterScema);

export default MinterReplenishment;