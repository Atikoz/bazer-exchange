const config = require("../../config.js")
const { getTransaction } = require("../minterTransaction.js")

const getMinterRewardsTx = async () => {
  const allTx = await getTransaction(config.adminMinterWallet);
  const rewardsTx = allTx.filter(tx => tx.type === 13);


  const minterReward = rewardsTx.filter(tx => {
    const payload = Buffer.from(tx.payload, 'base64').toString('utf-8');
    return payload.includes("Rewards from BazerHUB Virtual Oracle");
  });

  return minterReward
};

module.exports = getMinterRewardsTx;