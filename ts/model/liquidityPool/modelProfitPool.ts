import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі ProfitPool
interface IProfitPool extends Document {
  id: string;
  profit: number;
}

// Схема для моделі ProfitPool
const ProfitPoolSchema: Schema<IProfitPool> = new Schema({
  id: { type: String, required: true },
  profit: { type: Number, required: true }
});

// Модель ProfitPool
const ProfitPoolModel: Model<IProfitPool> = mongoose.model<IProfitPool>('Profit-pool-model', ProfitPoolSchema);

export default ProfitPoolModel;
