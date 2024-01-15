const BalanceUserModel = require("../model/modelBalance");

class BalanceManager {
  freezeBalance = async (userId, amount, coin) => {
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

  unfreezeBalance = async (userId, amount, coin) => {
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

module.exports = new BalanceManager();