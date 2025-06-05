import { model, Schema } from "mongoose";

const RewardMinterSchema = new Schema({
  hash: {
    type: String,
    required: true,
    uniq: true
  },
  amountReward: {
    type: Number,
    required: true
  },
});

const RewardMinter = model('reward-minter', RewardMinterSchema);

export default RewardMinter;