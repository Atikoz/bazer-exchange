const BalanceUserModel = require('../model/user/modelBalance.js');

async function ControlUserBalance(id, coin, amount) {
  try {
    await BalanceUserModel.updateOne(
      { id: id },
      JSON.parse(`{"$inc": { "main.${coin}": ${amount}} }`)
    );
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = ControlUserBalance;