const BalanceUserModel = require("../../model/modelBalance")

const getUserAllBalanceCoin = async (coin) => {
  const allCoin = await BalanceUserModel.find();

  const arrayUserAllBalance = allCoin.map(item => {
    return {
      id: item.id,
      amount: item.main[coin] + item.hold[coin]
    };
  });

  return arrayUserAllBalance
};

module.exports = getUserAllBalanceCoin;