import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі TransactionMpxXfiStatus
interface ITransactionMpxXfiStatus extends Document {
  id: string;
  coin: string;
  hash: string;
  status: string;
  amount: number;
}

// Схема для моделі TransactionMpxXfiStatus
const TransactionMpxXfiStatusSchema: Schema<ITransactionMpxXfiStatus> = new Schema({
  id: { type: String, required: true },
  coin: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true }
});

// Модель TransactionMpxXfiStatus
const TransactionMpxXfiStatusModel: Model<ITransactionMpxXfiStatus> = mongoose.model<ITransactionMpxXfiStatus>('Transaction-Mpx-Xfi-Status', TransactionMpxXfiStatusSchema);

export default TransactionMpxXfiStatusModel;
