import { model, Schema } from "mongoose";

const ArteryReplenishmentSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    uniq: true
  },
  amount: {
    type: Number,
    required: true
  },
  amountCommission: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

const ArteryReplenishment = model('Artery-Replenishment-Admin-Wallet', ArteryReplenishmentSchema)

export default ArteryReplenishment;