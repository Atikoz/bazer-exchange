import mongoose, { Document, Schema, Model } from 'mongoose';

interface IExchangeStatus extends Document {
  id: string,
  hash: string,
  status: string,
  processed: boolean,
  coinSell: string,
  coinBuy: string
}

const HashReplenishmentSchema: Schema<IExchangeStatus> = new Schema({
  id: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, required: true },
  processed: { type: Boolean, required: true },
  coinSell: { type: String, required: true },
  coinBuy: { type: String, required: true }});

const ExchangeStatus: Model<IExchangeStatus> = mongoose.model<IExchangeStatus>('ExchangeStatus', HashReplenishmentSchema);

export default ExchangeStatus;