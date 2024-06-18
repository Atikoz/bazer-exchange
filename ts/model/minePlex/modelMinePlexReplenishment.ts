import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі MinePlexReplenishment
interface IMinePlexReplenishment extends Document {
  id: string;
  coin: string;
  hash: string;
  amount: number;
}

// Схема для моделі MinePlexReplenishment
const MinePlexReplenishmentSchema: Schema<IMinePlexReplenishment> = new Schema({
  id: { type: String, required: true },
  coin: { type: String, required: true },
  hash: { type: String, required: true },
  amount: { type: Number, required: true }
});

// Модель MinePlexReplenishment
const MinePlexReplenishment: Model<IMinePlexReplenishment> = mongoose.model<IMinePlexReplenishment>('MinePlexReplenishment', MinePlexReplenishmentSchema);

export default MinePlexReplenishment;
