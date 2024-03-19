const BalanceUserModel = require('../model/modelBalance.js');

async function ControlUserBalance(id, coin, amount) {
  await BalanceUserModel.updateOne(
    { id: id },
    JSON.parse(`{"$inc": { "main.${coin}": ${amount}} }`)
  );
};

module.exports = { ControlUserBalance };