const ProfitPoolModel = require("../model/profitLiquidityPool");

const poolProfitManagement = async (userId, amount) => {
  try {
    await ProfitPoolModel.updateOne(
      { id: userId },
      JSON.parse(`{"$inc": { "profit": ${amount} } }`)
    );
  } catch (error) {
    console.error(error)
  }
};

module.exports = poolProfitManagement;