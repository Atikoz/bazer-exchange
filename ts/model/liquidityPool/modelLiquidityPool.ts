import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для схеми PoolUser
interface PoolUser {
  id: number;
  amountFirstCoin: number;
  amountSecondCoin: number;
}

// Інтерфейс для документа моделі LiquidityPool
export interface ILiquidityPool extends Document {
  firstCoin: string;
  secondCoin: string;
  poolUser: PoolUser[];
}

// Схема для моделі LiquidityPool
const LiquidityPoolSchema: Schema<ILiquidityPool> = new Schema({
  firstCoin: { type: String, required: true },
  secondCoin: { type: String, required: true },
  poolUser: [
    {
      id: { type: Number, required: true },
      amountFirstCoin: { type: Number, required: true },
      amountSecondCoin: { type: Number, required: true },
    },
  ],
});

// Модель LiquidityPool
const LiquidityPoolModel: Model<ILiquidityPool> = mongoose.model<ILiquidityPool>('Liquidity-pool-model', LiquidityPoolSchema);

export default LiquidityPoolModel;
