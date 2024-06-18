import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі TransactionUsdtStatus
interface ITransactionUsdtStatus extends Document {
  id: string;
  coin: string;
  hash: string;
  status: string;
  amount: number;
}

// Схема для моделі TransactionUsdtStatus
const TransactionUsdtStatusSchema: Schema<ITransactionUsdtStatus> = new Schema({
  id: { type: String, required: true },
  coin: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true }
});

// Модель TransactionUsdtStatus
const TransactionUsdtStatusModel: Model<ITransactionUsdtStatus> = mongoose.model<ITransactionUsdtStatus>('TransactionUsdtStatus', TransactionUsdtStatusSchema);

export default TransactionUsdtStatusModel;
