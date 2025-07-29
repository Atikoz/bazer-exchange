import { model, Schema } from "mongoose";

export interface ICrossfiReward extends Document {
  hash: string;
  amount: number;
}

const CrossfiRewardSchema = new Schema({
  hash: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
},
  {
    timestamps: true
  });

const CrossfiReward = model('Crossfi-Reward', CrossfiRewardSchema);

export default CrossfiReward;