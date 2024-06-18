import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі TransactionMinterStatus
interface ITransactionMinterStatus extends Document {
  id: string;
  hash: string;
  status: string;
  amount: number;
  coin: string;
}

// Схема для моделі TransactionMinterStatus
const TransactionMinterStatusSchema: Schema<ITransactionMinterStatus> = new Schema({
  id: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  coin: { type: String, required: true }
});

// Модель TransactionMinterStatus
const TransactionMinterStatusModel: Model<ITransactionMinterStatus> = mongoose.model<ITransactionMinterStatus>('Transaction-Minter-Status', TransactionMinterStatusSchema);

export default TransactionMinterStatusModel;
