import { MinterTransaction, TransactionMultiSend } from "../../../interface/MinterInterface";
import BuyBazerhubMinter from "../../../models/minter/modelBuyBazerhubMinter";
import RewardMinter from "../../../models/minter/modelRewardTxMinter";
import BalanceUser from "../../../models/user/BalanceModel";
import BalanceService from "../../balance/BalanceService";
import { LiquidityCalculator } from "../../../utils/calculators/LiquidityCalculator";
import BotService from "../../telegram/BotService";
import MinterService from "./minterService";
import Big from "big.js";

const ADMIN_WALLET_MINTER = process.env.ADMIN_WALLET_MINTER;


class RewardMinterServise extends MinterService {
  private readonly REWARD_MARKER_100CASHBAC = "Реварды расписок 100%CASHBACK";
  private readonly REWARD_MARKER_BazerHUB = "Rewards from BazerHUB Virtual Oracle";
  private readonly MINTER_REWARD_TX_TYPE = 13;

  private decodeBase64Utf8Safe(b64: string): string | null {
    if (!b64) return null;

    let s = b64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    try {
      return Buffer.from(s, "base64").toString("utf-8");
    } catch {
      return null;
    }
  };

  private async getRewardsByMarker(marker: string): Promise<TransactionMultiSend[]> {
    const txs = await this.getTransaction(ADMIN_WALLET_MINTER);
    if (!Array.isArray(txs) || txs.length === 0) return [];

    const res: TransactionMultiSend[] = [];
    for (const tx of txs) {
      if (Number(tx?.type) !== this.MINTER_REWARD_TX_TYPE) continue;
      const decoded = this.decodeBase64Utf8Safe((tx as any).payload);
      if (decoded?.includes(marker)) {
        res.push(tx as TransactionMultiSend);
      }
    }
    return res;
  };

  private async getTotalBalanceForCoin(coin: string): Promise<Big> {
    const docs = await BalanceUser.find();
    return docs.reduce(
      (sum, b) =>
        sum
          .plus(new Big(b?.main?.[coin] ?? 0))
          .plus(new Big(b?.hold?.[coin] ?? 0)),
      new Big(0)
    );
  };

  async getRewardsBazerHUB(): Promise<TransactionMultiSend[]> {
    return this.getRewardsByMarker(this.REWARD_MARKER_BazerHUB);
  }

  async getTxRewards100CASHBACK(): Promise<TransactionMultiSend[]> {
    return this.getRewardsByMarker(this.REWARD_MARKER_100CASHBAC);
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
  };

  async accrualRewards(): Promise<void> {
    try {
      console.log('[accrualRewards] Start');

      const STREAMS = [
        {
          name: "BAZERHUB",
          marker: this.REWARD_MARKER_BazerHUB,
          stakeCoin: "bazerhub",
          payoutCoin: "usdtbsc",
        },
        {
          name: "100CASHBACK",
          marker: this.REWARD_MARKER_100CASHBAC,
          stakeCoin: "100cashbac",
          payoutCoin: "bip",
        },
      ] as const;

      const [txByStream, totalsByStream, usersByStream] = await Promise.all([
        Promise.all(STREAMS.map(s => this.getRewardsByMarker(s.marker))),
        Promise.all(STREAMS.map(s => this.getTotalBalanceForCoin(s.stakeCoin))),
        Promise.all(STREAMS.map(s => BalanceService.getUsersTotalBalanceByCoin(s.stakeCoin))),
      ]);

      for (let i = 0; i < STREAMS.length; i++) {
        const cfg = STREAMS[i];
        const rewardsTx = txByStream[i] ?? [];
        const totalStake = totalsByStream[i] ?? new Big(0);
        const users = usersByStream[i] ?? [];

        if (rewardsTx.length === 0) continue;

        for (const tx of rewardsTx) {
          console.log(tx)
          const isAlreadyHandled = await RewardMinter.exists({ hash: tx.hash });
          if (isAlreadyHandled) {
            continue;
          }

          const findMyReward = tx?.data?.list.find((el) => el.to === ADMIN_WALLET_MINTER);
          if (!findMyReward) {
            continue;
          }

          const amountReward = new Big(findMyReward.value ?? 0);
          if (amountReward.lte(0)) continue;

          const onePercent = amountReward.div(100);
          const logMsg: string[] = [];

          const rewardPromises = users.map(user => {
            const userPercent = LiquidityCalculator.percentInvestor(totalStake.toNumber(), user.amount);
            const userReward = onePercent.times(userPercent);

            if (userReward.lte(0)) return null;

            const rewardStr = userReward.toFixed(6);

            logMsg.push(`Пользователю ${user.id} начислено ревард в размере ${rewardStr} ${cfg.payoutCoin.toUpperCase()} за хранение ${cfg.name}`);

            return BalanceService.updateBalance(user.id, cfg.payoutCoin, +rewardStr)
              .then(() => BotService.sendMessage(user.id, `Вам начислено ревард в размере ${userReward} ${cfg.payoutCoin.toUpperCase()} за хранение ${cfg.name}. Спасибо что вы с нами!`))
          }).filter(Boolean);

          await Promise.all([
            ...rewardPromises,
            BotService.sendLog(logMsg.join('\n')),
            RewardMinter.create({ hash: tx.hash, amountReward })
          ]);
        }
      }
    } catch (error) {
      console.error('error accrual minter rewards:', error);
    }
  };
}

export default new RewardMinterServise();