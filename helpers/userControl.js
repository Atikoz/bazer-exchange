const BalanceUserModel = require('../model/modelBalance.js');

async function ControlUserBalance(id, coin, amount) {
  try {
    console.log('id: ', id);
    console.log('coin: ', coin);
    console.log('amount: ', amount);

    const b = await BalanceUserModel.findOne({id: id});
    console.log('before', b);



    await BalanceUserModel.updateOne(
      { id: id },
      JSON.parse(`{"$inc": { "main.${coin}": ${amount}} }`)
    );

    const a = await BalanceUserModel.findOne({id: id});
    console.log('after', a);

  } catch (error) {
    console.error(error.message);
    console.log('ошибка тут');
  }
};

module.exports = { ControlUserBalance };