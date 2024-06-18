import LiquidityPoolModel, { ILiquidityPool } from "../../model/liquidityPool/modelLiquidityPool";

const DistributeSecondCoin = async (firstCoin: string, secondCoin: string, userId: number, percent: number, amount: number): Promise<void> => {
  try {
    const findPool: ILiquidityPool | null = await LiquidityPoolModel.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });
    if (!findPool) {
      throw new Error('Profit pool not found');
    }

    const findUser = findPool.poolUser.find(user => user.id === userId);
    if (!findUser) {
      throw new Error('User not found in the profit pool');
    }
    const onePercent = amount / 100;
    const sumInvestor = percent * onePercent;

    findUser.amountSecondCoin += sumInvestor;
    findPool.markModified('poolUser');

    await findPool.save();
    
    // return { success: true, message: 'Profit distributed successfully' };
  } catch (error) {
    console.error(error);
    // return { success: false, message: error.message };
  }
};

export default DistributeSecondCoin;