import { model, Schema } from "mongoose";

const ExchangeStatusSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    uniq: true
  },
  status: {
    type: String,
    required: true
  },
  processed: {
    type: Boolean,
    required: true
  },
  coinSell: {
    type: String,
    required: true
  },
  coinBuy: {
    type: String,
    required: true
  }
})

const ExchangeStatus = model('ExchangeStatus', ExchangeStatusSchema);

export default ExchangeStatus;