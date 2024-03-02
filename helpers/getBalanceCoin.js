const userManagement = require("../service/userManagement");

const getBalanceCoin = async (userId, coin) => {
  const infoUser = await userManagement.getInfoUser(userId);
  const balanceCoin = infoUser.userBalance.main[coin];
  console.log('balanceCoin: ', balanceCoin);

  return balanceCoin
};

module.exports = getBalanceCoin;