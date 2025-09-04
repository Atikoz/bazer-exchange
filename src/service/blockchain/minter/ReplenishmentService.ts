import sleep from "../../../function/sleepFunction";
import { MinterTransaction } from "../../../interface/MinterInterface";
import MinterReplenishment from "../../../models/minter/modelMinterReplenishment";
import TransactionMinterStatus from "../../../models/minter/modelMinterStatusTransaction";
import BalanceUser from "../../../models/user/BalanceModel";
import { fromBaseUnit } from "../../../utils/unitConversion";
import EncryptionService from "../../security/EncryptionService";
import BotService from "../../telegram/BotService";
import UserManagement from "../../user/UserManagement";
import minterService from "./minterService";

const ADMIN_WALLET_MINTER = process.env.ADMIN_WALLET_MINTER;
const MNEMONIC = process.env.MNEMONIC;


class ReplenishmentMinter extends minterService {
  private readonly adminWallet = ADMIN_WALLET_MINTER;
  private readonly mnemonic = MNEMONIC;

  private minimumAmounts: Record<string, number> = {
    BIP: 100,
    HUB: 0.01,
    MONSTERHUB: 0.01,
    BNB: 0.0001,
    USDTBSC: 2,
    BIPKAKAXA: 30,
    CASHBSC: 500,
    BAZERCOIN: 50,
    RUBLE: 5,
    BAZERHUB: 0.5,
    "100CASHBAC": 10,
  };

  checkUserTransaction = async (id: number): Promise<void> => {
    try {
      const getInfoUser = await UserManagement.getInfoUser(id);
      const userAddress = getInfoUser.userWallet.minter.address;
      const encryptedUserSeed = getInfoUser.userWallet.mnemonic;
      const userSeed = EncryptionService.decryptSeed(encryptedUserSeed);

      const userTransactionArr: MinterTransaction[] = await sleep(5000).then(async () => await this.getTransaction(userAddress));

      for (const transaction of userTransactionArr) {
        const { type, data, hash } = transaction;

        if (type === 13) {
          continue
        }

        const coin = data.coin.symbol;
        const minimumAmount = this.minimumAmounts[coin];

        const alreadyExists = await MinterReplenishment.exists({ id, hash: hash });
        const isToUser = data.to === userAddress;
        const isAboveMinimum = +data.value >= minimumAmount;
        const isAllowedCoin = Object.keys(this.minimumAmounts).includes(coin);

        if (!alreadyExists && isToUser && isAboveMinimum && isAllowedCoin) {
          console.log('found transaction:', hash);

          const coinId = await this.getCoinId(coin);
          const commissionTransfer = await sleep(5000).then(() => this.getCommissionTx(this.adminWallet, +data.value, coinId));

          console.log('transfer commission:', commissionTransfer, 'bip');
          if (coin === 'BIP') {
            const amountTransferAdminWallet = +data.value - commissionTransfer;
            const sendBipAdminWallet = await sleep(5000).then(() => this.sendMinter(this.adminWallet, amountTransferAdminWallet, userSeed, coin));

            if (!sendBipAdminWallet.status) {
              console.log('transfer error:', sendBipAdminWallet.error);
              continue
            }

            await TransactionMinterStatus.create({
              id,
              hash: sendBipAdminWallet.hash,
              status: 'Send Admin',
              amount: data.value,
              coin
            });
          } else {
            const bipBalanceObj = (await this.getBalance(userAddress)).find(b => b.coin.symbol === 'BIP') ?? null;
            const balanceBip = bipBalanceObj ? parseFloat(fromBaseUnit(bipBalanceObj.value)) : 0;

            if (commissionTransfer > balanceBip) {
              const topUpAmount = commissionTransfer - balanceBip;
              await this.sendMinter(userAddress, topUpAmount, this.mnemonic, 'bip');
              await sleep(5000);
            }

            const sendCoinAdminWallet = await this.sendMinter(this.adminWallet, +data.value, userSeed, coin);

            await TransactionMinterStatus.create({
              id,
              hash: sendCoinAdminWallet.hash,
              status: 'Send Admin',
              amount: data.value,
              coin
            });
          }

          await MinterReplenishment.create({
            id,
            hash: hash,
            amount: data.value,
            coin
          });

          console.log('minter hash model created');
        }
      }
    } catch (error) {
      console.error('check User Transaction minter error:', error);
      return
    }
  };

  checkAdminWallet = async (): Promise<void> => {
    try {
      const adminTransactions = await TransactionMinterStatus.find({ status: { $ne: 'Done' } });

      if (!adminTransactions.length) {
        return
      }

      for (const transaction of adminTransactions) {
        const resultTx = await sleep(5000).then(() => this.checkMinterHash(transaction.hash));

        if (resultTx.code === '0') {
          await TransactionMinterStatus.updateOne({ hash: transaction.hash }, { status: 'Done' });

          const coin = transaction.coin;
          const amount = transaction.amount;

          const balanceField = coin === 'BAZERCOIN' ? 'main.minterBazercoin' : `main.${coin.toLowerCase()}`;
          await BalanceUser.updateOne({ id: transaction.id }, { $inc: { [balanceField]: amount } });

          await BotService.sendMessage(transaction.id, `Ваш счет был пополнен на ${amount} ${coin.toUpperCase()}`);
          await BotService.sendLog(`Пользователь ${transaction.id} пополнил счет на ${amount} ${coin.toUpperCase()}`);
        } else {
          console.log('transaction failed', resultTx);
          await BotService.sendMessage(transaction.id, `❌ При пополнении возникла ошибка, обратитесь в техподдержку. TxHash:<code>${transaction.hash}</code>`);
        }
      }
    } catch (error) {
      console.error('Check Minter Admin Wallet error:', error);
    }
  };
}

export default new ReplenishmentMinter;