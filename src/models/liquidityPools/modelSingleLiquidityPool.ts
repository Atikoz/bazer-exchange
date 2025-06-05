import { Document, Schema, model } from "mongoose";

interface PoolUser {
  id: number;
  amountFirstCoin: number;
  amountSecondCoin: number;
}

export interface SingleLiquidityPoolDocument extends Document {
  firstCoin: string;
  secondCoin: string;
  poolUser: PoolUser[];
}

const poolUserSchema = new Schema<PoolUser>({
  id: { type: Number, required: true },
  amountFirstCoin: { type: Number, required: true },
  amountSecondCoin: { type: Number, required: true },
})

const SingleLiquidityPoolSchema = new Schema<SingleLiquidityPoolDocument>({
  firstCoin: { type: String, required: true },
  secondCoin: { type: String, required: true },
  poolUser: { type: [poolUserSchema], required: true }
});

const SingleLiquidityPool = model('single-liquidity-pool', SingleLiquidityPoolSchema);

export default SingleLiquidityPool;