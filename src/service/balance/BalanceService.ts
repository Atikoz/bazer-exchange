import DoubleLiquidityPool from "../../models/liquidityPools/modelDoubleLiqPools";
import BalanceUser from "../../models/user/BalanceModel";

class BalanceService {
  static async freeze(userId: number, amount: number, coin: string): Promise<void> {
    const normalized = coin.toLowerCase();

    await BalanceUser.updateOne(
      { id: userId },
      { $inc: { [`main.${normalized}`]: -amount } }
    );
    await BalanceUser.updateOne(
      { id: userId },
      { $inc: { [`hold.${normalized}`]: amount } }
    );
  }

  static async unfreeze(userId: number, amount: number, coin: string): Promise<void> {
    const normalized = coin.toLowerCase();

    await BalanceUser.updateOne(
      { id: userId },
      { $inc: { [`main.${normalized}`]: amount } }
    );
    await BalanceUser.updateOne(
      { id: userId },
      { $inc: { [`hold.${normalized}`]: -amount } }
    );
  }

  static async updateBalance(userId: number, coin: string, amount: number): Promise<void> {
    await BalanceUser.updateOne(
      { id: userId },
      { $inc: { [`main.${coin}`]: amount } }
    );
  }

  static async updateHoldBalance(userId: number, coin: string, amount: number): Promise<void> {
    await BalanceUser.updateOne(
      { id: userId },
      { $inc: { [`hold.${coin}`]: amount } }
    );
  }

  static async getUsersTotalBalanceByCoin(coin: string): Promise<{ id: number, amount: number }[]> {
    const users = await BalanceUser.find();

    const pools = await DoubleLiquidityPool.find({
      $or: [{ firstCoin: coin }, { secondCoin: coin }]
    });

    const arrayUserAllBalance = users.map(user => {
      const userId = user.id;
      let totalAmount = user.main[coin] + user.hold[coin];

      for (const pool of pools) {
        const userInPool = pool.poolUser.find(p => p.id === userId);
        if (userInPool) {
          if (pool.firstCoin === coin) {
            totalAmount += userInPool.amountFirstCoin;
          } else if (pool.secondCoin === coin) {
            totalAmount += userInPool.amountSecondCoin;
          }
        }
      }

      return {
        id: userId,
        amount: totalAmount
      };
    });

    return arrayUserAllBalance
  }

  static async getBalance(userId: number, coin: string): Promise<number> {
    const user = await BalanceUser.findOne({ id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    return user.main[coin] || 0;
  }
}

export default BalanceService