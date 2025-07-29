import { MinterTransaction } from "../../../interface/MinterInterface";
import BuyBazerhubMinter from "../../../models/minter/modelBuyBazerhubMinter";
import RewardMinter from "../../../models/minter/modelRewardTxMinter";
import BalanceUser from "../../../models/user/BalanceModel";
import BalanceService from "../../balance/BalanceService";
import { LiquidityCalculator } from "../../../utils/calculators/LiquidityCalculator";
import BotService from "../../telegram/BotService";
import MinterService from "./minterService";

const ADMIN_WALLET_MINTER = process.env.ADMIN_WALLET_MINTER;

class RewardMinterServise extends MinterService {
  async getMinterRewardsTx(): Promise<MinterTransaction[]> {
    const allTx = await this.getTransaction(ADMIN_WALLET_MINTER);
    const rewardsTx = allTx.filter(tx => tx.type === 13);

    const minterReward = rewardsTx.filter(tx => {
      const payload = Buffer.from(tx.payload, 'base64').toString('utf-8');

      return payload.includes("Rewards from BazerHUB Virtual Oracle");
    });

    return minterReward
  }

  async checkTxBuyBazerHub(): Promise<void> {
    try {
      const [allTx, purchasesTxArray] = await Promise.all([
        this.getTransaction(ADMIN_WALLET_MINTER),
        BuyBazerhubMinter.find()
      ]);

      for (const purchaseTx of purchasesTxArray) {
        const matchedTx = allTx.find(tx => {
          const decodedPayload = Buffer.from(tx.payload, 'base64').toString('utf-8');
          return decodedPayload === purchaseTx.hash;
        });

        if (!matchedTx) {
          continue;
        }

        const purchaseAmount = matchedTx.type === 1 ? +matchedTx.data.value : 0;

        await Promise.all([
          BalanceService.updateBalance(purchaseTx.id, 'bazerhub', purchaseAmount),
          BuyBazerhubMinter.deleteOne({ hash: purchaseTx.hash }),
          BotService.sendMessage(purchaseTx.id, `Вы успешно купили ${purchaseAmount} BazerHub!`),
          BotService.sendLog(`Пользователь ${purchaseTx.id} приобрел ${purchaseAmount} BazerHub через бота @bazerp2p_bot`)
        ]);
      }
    } catch (error) {
      console.error('ERROR checkTxBuyBazerHub:', error.message)
    }
  }

  async accrualRewards(): Promise<void> {
    try {
      console.log('[accrualRewards] Start');

      const [rewardsTx, arrayUserBalance, users] = await Promise.all([
        this.getMinterRewardsTx(),
        BalanceUser.find(),
        BalanceService.getUsersTotalBalanceByCoin('bazerhub')
      ]);

      const balanceBazerHub = arrayUserBalance.reduce((total, item) => 
        total + item.main.bazerhub + item.hold.bazerhub
      , 0);

      for (const tx of rewardsTx) {
        const isAlreadyHandled = await RewardMinter.exists({ hash: tx.hash });

        if (isAlreadyHandled) {
          continue;
        }

        if (tx.type !== 13) {
          continue;
        }

        const findMyReward = tx.data.list.find((el) => el.to === ADMIN_WALLET_MINTER);

        if (findMyReward) {
          continue;
        }

        const amountReward = +findMyReward.value;
        const onePercentReward = amountReward / 100;
        const logMsg: string[] = [];

        const rewardPromises = users.map(user => {
          const userPercent = LiquidityCalculator.percentInvestor(balanceBazerHub, user.amount);
          const userReward = onePercentReward * userPercent;
  
          if (userReward <= 0) return null;
  
          logMsg.push(`Пользователю ${user.id} начислено ревард в размере ${userReward} USDTBSC за хранение BazerHub`);
  
          return BalanceService.updateBalance(user.id, 'usdtbsc', userReward)
            .then(() => BotService.sendMessage(user.id, `Вам начислено ревард в размере ${userReward} USDTBSC за хранение BazerHub. Спасибо что вы с нами!`))
          }).filter(Boolean);

        await Promise.all([
          ...rewardPromises,
          BotService.sendLog(logMsg.join('\n')),
          RewardMinter.create({ hash: tx.hash, amountReward })
        ]);
      }
    } catch (error) {
      console.error('error accrual minter rewards:', error.message);
    }
  }
}

export default new RewardMinterServise();