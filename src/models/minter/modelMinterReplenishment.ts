import { model, Schema } from "mongoose";

const MinterReplenishmentSchema = new Schema({
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
  coin: {
    type: String,
    required: true
  }
});

const MinterReplenishment = model('Minter-Replenishment', MinterReplenishmentSchema);

export default MinterReplenishment;