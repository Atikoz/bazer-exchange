import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі TransactionStatus
interface ITransactionStatus extends Document {
  id: string;
  hash: string;
  status: string;
  amount: number;
  processed: boolean;
}

// Схема для моделі TransactionStatus
const TransactionStatusSchema: Schema<ITransactionStatus> = new Schema({
  id: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  processed: { type: Boolean, required: true }
});

// Модель TransactionStatus
const TransactionStatusModel: Model<ITransactionStatus> = mongoose.model<ITransactionStatus>('TransactionStatus', TransactionStatusSchema);

export default TransactionStatusModel;
