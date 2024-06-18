import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі HashReplenishment
interface IHashReplenishment extends Document {
  id: string;
  coin: string;
}

// Схема для моделі HashReplenishment
const HashReplenishmentSchema: Schema<IHashReplenishment> = new Schema({
  id: { type: String, required: true },
  coin: { type: String, required: true }
});

// Модель HashReplenishment
const HashReplenishmentModel: Model<IHashReplenishment> = mongoose.model<IHashReplenishment>('HashReplenishment', HashReplenishmentSchema);

export default HashReplenishmentModel;
