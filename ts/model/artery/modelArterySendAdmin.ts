import mongoose, { Document, Schema, Model } from 'mongoose';

interface IArteryReplenishment extends Document {
  id: String,
  hash: String,
  amount: Number,
  amountCommission: Number,
  status: String
}

const ArteryReplenishmentSchema: Schema<IArteryReplenishment> = new Schema({
  id: { type: String, required: true },
  hash: { type: String, required: true },
  amount: { type: Number, required: true },
  amountCommission: { type: Number, required: true },
  status: { type: String, required: true }});

const ArteryReplenishment: Model<IArteryReplenishment> = mongoose.model<IArteryReplenishment>('Artery-Replenishment-Admin-Wallet', ArteryReplenishmentSchema);

export default ArteryReplenishment;