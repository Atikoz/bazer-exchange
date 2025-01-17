const BalanceUserModel = require("../model/user/modelBalance");

class BalanceManager {
  freezeBalance = async (userId, amount, coin) => {
    try {
      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "main.${coin.toLowerCase()}": -${amount} } }`)
      );

      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "hold.${coin.toLowerCase()}": ${amount} } }`)
      );
    } catch (error) {
      console.error(error)
    }
  };

  unfreezeBalance = async (userId, amount, coin) => {
    try {
      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "main.${coin.toLowerCase()}": ${amount} } }`)
      );
  
      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "hold.${coin.toLowerCase()}": -${amount} } }`)
      );
    } catch (error) {
      console.error(error)
    }
  };
}

module.exports = new BalanceManager();