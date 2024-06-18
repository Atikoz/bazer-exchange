import BalanceUserModel from "../model/modelBalance";

async function ControlUserBalance(id: number, coin: string, amount: number): Promise<void> {
  try {
    await BalanceUserModel.updateOne(
      { id: id },
      JSON.parse(`{"$inc": { "main.${coin}": ${amount}} }`)
    );
  } catch (error) {
    console.error(error.message);
  }
};

export default ControlUserBalance;