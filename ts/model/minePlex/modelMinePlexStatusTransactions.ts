import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі TransactionMinePlexStatus
interface ITransactionMinePlexStatus extends Document {
  id: string;
  coin: string;
  hash: string;
  status: string;
  amount: number;
  processed: boolean;
}

// Схема для моделі TransactionMinePlexStatus
const TransactionMinePlexStatusSchema: Schema<ITransactionMinePlexStatus> = new Schema({
  id: { type: String, required: true },
  coin: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  processed: { type: Boolean, required: true }
});

// Модель TransactionMinePlexStatus
const TransactionMinePlexStatusModel: Model<ITransactionMinePlexStatus> = mongoose.model<ITransactionMinePlexStatus>('TransactionMinePlexStatus', TransactionMinePlexStatusSchema);

export default TransactionMinePlexStatusModel;
