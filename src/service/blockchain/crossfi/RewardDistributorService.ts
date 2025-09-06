import Big from "big.js";
import { ICrossfiEvmTx } from "../../../interface/CrossfiInterfaces";
import BalanceService from "../../balance/BalanceService";
import CrossfiService from "./crossfiService";
import CrossfiReward from "../../../models/crossfi/CrossfiReward";
import BotService from "../../telegram/BotService";

export class RewardDistributorService extends CrossfiService {
  private readonly rewardWallet: string = process.env.CROSSFI_REWARD_ADDRESS;
  private readonly adminWallet: string = process.env.ADMIN_WALLET_CROSSFI;

  async distributeRewards() {
    const reward = await this.getUserTx(this.adminWallet, true);
    const evmReward = reward as ICrossfiEvmTx[];

    const users = await BalanceService.getUsersTotalBalanceByCoin('bzr');
    const filteredUsers = users.filter(user => user.amount > 0);

    if (filteredUsers.length === 0) {
      console.log("❌ There are no users with a BZR balance.");
      return;
    }

    for (const tx of evmReward) {
      const sender = tx.body?.messages?.[0]?.data?.from;
      const hash = tx.evm_txhashes?.[0];

      if (!sender || !hash) continue;

      const isExists = await CrossfiReward.exists({ hash });

      if (isExists) {
        console.log(`✅ The hash: ${hash} is already in the database.`);
        continue
      }

      if (sender === this.rewardWallet) {
        const rawValue = tx.body.messages[0].data.value;
        const totalReward = new Big(rawValue).div("1e18");

        const rewards = this.calculateProportionalRewards(totalReward, filteredUsers);

        await CrossfiReward.create({
          hash,
          amount: Number(totalReward.toFixed(18))
        });

        const logMsg = [`Начисления за холд токена BZR\n📊 Количество участников: ${filteredUsers.length}\n`];

        for (const r of rewards) {
          await this.creditReward(r.id, +r.reward.toFixed(6), logMsg);
        }

        await BotService.sendLog(logMsg.join('\n'))
      }
    }
  }

  private calculateProportionalRewards(
    totalReward: Big,
    userBalances: { id: number; amount: number }[]
  ): { id: number; reward: number }[] {
    const total = userBalances.reduce(
      (sum, user) => sum.plus(user.amount),
      new Big(0)
    );

    if (total.eq(0)) return [];

    return userBalances.map(user => {
      const userAmount = new Big(user.amount);
      const share = userAmount.div(total);
      const userReward = totalReward.times(share);
      return {
        id: user.id,
        reward: Number(userReward.toFixed(18))
      };
    });
  }

  private async creditReward(userId: number, amount: number, logMsg: string[]) {
    logMsg.push(`Пользователь: ${userId}, сумма: ${amount} XFI`);

    await BalanceService.updateBalance(userId, 'xfi', +amount);
    await BotService.sendMessage(userId, `🎉💰 Начислено вознаграждение за холдинг токена BZR\nСумма: ${amount} XFI`)
  }
}