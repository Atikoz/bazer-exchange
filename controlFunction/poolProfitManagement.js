const ProfitPoolModel = require("../model/user/modelProfitPool");

const poolProfitManagement = async (userId, amount) => {
  try {
    await ProfitPoolModel.updateOne(
      { id: userId },
      JSON.parse(`{"$inc": { "profit": ${amount} } }`)
    );
  } catch (error) {
    console.error(error.message)
  }
};

module.exports = poolProfitManagement;