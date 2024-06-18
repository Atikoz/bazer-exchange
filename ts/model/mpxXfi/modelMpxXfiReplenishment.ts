import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі MpxXfiReplenishment
interface IMpxXfiReplenishment extends Document {
  id: string;
  coin: string;
  hash: string;
  amount: number;
}

// Схема для моделі MpxXfiReplenishment
const MpxXfiReplenishmentSchema: Schema<IMpxXfiReplenishment> = new Schema({
  id: { type: String, required: true },
  coin: { type: String, required: true },
  hash: { type: String, required: true },
  amount: { type: Number, required: true }
});

// Модель MpxXfiReplenishment
const MpxXfiReplenishmentModel: Model<IMpxXfiReplenishment> = mongoose.model<IMpxXfiReplenishment>('Mpx-Xfi-Replenishment', MpxXfiReplenishmentSchema);

export default MpxXfiReplenishmentModel;
