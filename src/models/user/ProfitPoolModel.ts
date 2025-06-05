import { model, Schema } from "mongoose";

const ProfitPoolSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  profit: {
    type: Number,
    default: 0
  }
});

const ProfitPool = model('Profit-pool-model', ProfitPoolSchema);

export default ProfitPool