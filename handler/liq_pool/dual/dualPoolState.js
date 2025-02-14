const dualPoolState = {
  dataSelectingUser: {},
  amount: {},
  comissionExchanger: {}
};

function setDualPoolData(userId, firstCoin, secondCoin, selectedInvestCoin, amount, comissionExchanger) {
  dualPoolState.dataSelectingUser[userId] = { firstCoin, secondCoin, selectedInvestCoin };
  dualPoolState.amount[userId] = amount;
  dualPoolState.comissionExchanger[userId] = comissionExchanger;
}

function getDualPoolData(userId) {
  return {
    firstCoin: dualPoolState.dataSelectingUser[userId]?.firstCoin || null,
    secondCoin: dualPoolState.dataSelectingUser[userId]?.secondCoin || null,
    selectedInvestCoin: dualPoolState.dataSelectingUser[userId]?.selectedInvestCoin || null,
    amount: dualPoolState.amount[userId] || null,
    comissionExchanger: dualPoolState.comissionExchanger[userId] || null
  };
}

module.exports = { dualPoolState, setDualPoolData, getDualPoolData };
