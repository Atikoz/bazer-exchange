import ProfitPool from "../../models/user/ProfitPoolModel";

export const poolProfitManagement = async (userId: number, amount: number) => {
  await ProfitPool.updateOne(
    { id: userId },
    JSON.parse(`{"$inc": { "profit": ${amount} } }`)
  );
};