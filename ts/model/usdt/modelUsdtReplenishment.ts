import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі UsdtReplenishment
interface IUsdtReplenishment extends Document {
  id: string;
  coin: string;
  hash: string;
  amount: number;
}

// Схема для моделі UsdtReplenishment
const UsdtReplenishmentSchema: Schema<IUsdtReplenishment> = new Schema({
  id: { type: String, required: true },
  coin: { type: String, required: true },
  hash: { type: String, required: true },
  amount: { type: Number, required: true }
});

// Модель UsdtReplenishment
const UsdtReplenishmentModel: Model<IUsdtReplenishment> = mongoose.model<IUsdtReplenishment>('UsdtReplenishment', UsdtReplenishmentSchema);

export default UsdtReplenishmentModel;