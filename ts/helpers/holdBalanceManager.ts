import BalanceUserModel from "../model/modelBalance";

class BalanceManager {
  public async freezeBalance (userId: number, amount: number, coin: string): Promise<void> {
    try {
      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "main.${coin}": -${amount} } }`)
      );

      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "hold.${coin}": ${amount} } }`)
      );
    } catch (error) {
      console.error(error)
    }
  };

  public async unfreezeBalance (userId: number, amount: number, coin: string): Promise<void> {
    try {
      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "main.${coin}": ${amount} } }`)
      );
  
      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "hold.${coin}": -${amount} } }`)
      );
    } catch (error) {
      console.error(error)
    }
  };
}

export default new BalanceManager;