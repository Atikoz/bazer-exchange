import ProfitPoolModel from "../model/liquidityPool/modelProfitPool";

const poolProfitManagement = async (userId: number, amount: number): Promise<void> => {
  try {
    await ProfitPoolModel.updateOne(
      { id: userId },
      JSON.parse(`{"$inc": { "profit": ${amount} } }`)
    );
  } catch (error) {
    console.error(error.message)
  }
};

export default poolProfitManagement;