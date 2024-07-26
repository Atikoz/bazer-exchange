const config = require("../../config");
const sendLogs = require("../../helpers/sendLog");
const { sendMessage } = require("../../helpers/tgFunction");
const { ControlUserBalance } = require("../../helpers/userControl");
const BalanceUserModel = require("../../model/modelBalance");
const RewardMinter = require("../../model/modelRewardTxMinter");
const PercentInvestor = require("../liquidityPool/percentInvestor");
const getMinterRewardsTx = require("./getMinterReward");
const getUserAllBalanceCoin = require("./getUserAllBalanceCoin");

const accrualRewards = async () => {
  try {
    console.log('start');
    const rewardsTx = await getMinterRewardsTx();
    const arrayUserBalance = await BalanceUserModel.find();

    const balanceBazerHub = arrayUserBalance.reduce((total, item) => {
      return total + parseFloat(item.main.bazerhub) + parseFloat(item.hold.bazerhub);
    }, 0);

    const users = await getUserAllBalanceCoin('bazerhub');


    for (const tx of rewardsTx) {
      const validationTx = (!await RewardMinter.findOne({ hash: tx.hash }));

      if (validationTx) {
        const findMyReward = tx.data.list.find((el) => el.to === config.adminMinterWallet)
        const amountReward = +findMyReward.value;
        const onePercentReward = amountReward / 100;
        const logMsg = [];

        for (const user of users) {
          const userPercent = PercentInvestor(balanceBazerHub, user.amount);
          const userReward = onePercentReward * userPercent;

          if (userReward <= 0) continue

          await ControlUserBalance(user.id, 'usdtbsc', userReward);
          sendMessage(user.id, `Вам начислено ревард в размере ${userReward} USDTBSC за хранение BazerHub. Спасибо что вы с нами!`)
          logMsg.push(`Пользователю ${user.id} начислено ревард в размере ${userReward} USDTBSC за хранение BazerHub`);
        }
        sendLogs(logMsg.join('\n'))
        await RewardMinter.create({
          hash: tx.hash,
          amountReward: amountReward
        })
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = accrualRewards;