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

  static async getBalanceAllUsersCoins(coin: string): Promise<{ id: number, amount: number }[]> {
    const users = await BalanceUser.find();

    const arrayUserAllBalance = users.map(item => {
      return {
        id: item.id,
        amount: item.main[coin] + item.hold[coin]
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