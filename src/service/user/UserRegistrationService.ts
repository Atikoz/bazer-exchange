import BalanceUser from "../../models/user/BalanceModel";
import FreeAccount from "../../models/user/FreeAccountModel";
import ProfitPool from "../../models/user/ProfitPoolModel";
import User from "../../models/user/UserModel";
import WalletUser from "../../models/user/WalletUser";
import BotService from "../telegram/BotService";
import AuthFallback from "./AuthFallback";
import { FreeAccountService } from "./FreeAccountService";


export class UserRegistrationService {
  static async registerUser(userId: number, email: string | null = null): Promise<{
    status: string;
    message: string;
    mnemonic: string;
  }> {
    try {
      const [existingUser, freeAccount] = await Promise.all([
        User.findOne({ id: userId }).lean(),
        FreeAccount.findOne({ busy: false }).lean()
      ]);

      if (existingUser) {
        const walletUser = await WalletUser.findOne({ id: userId }).lean();
        return {
          status: 'ok',
          message: 'user registered',
          mnemonic: walletUser?.mnemonic || ''
        };
      }

      if (!freeAccount) {
        console.log('karau')
        return AuthFallback.register(userId, email);
      }

      await FreeAccountService.markAsBusy(freeAccount.mnemonic);

      await User.create({ id: userId, mail: email });
      await ProfitPool.create({ id: userId });
      await WalletUser.create({
        id: userId,
        mnemonic: freeAccount.mnemonic,
        del: freeAccount.del,
        usdt: freeAccount.usdt,
        crossfi: freeAccount.crossfi,
        artery: freeAccount.artery,
        minter: freeAccount.minter
      });
      await BalanceUser.create({ id: userId });
      await FreeAccountService.delete(freeAccount.mnemonic);

      await BotService.sendLog(`Пользователь ${userId} зарегестрировался в боте. Добро пожаловать!`);

      return {
        status: 'ok',
        message: 'user registered successfully',
        mnemonic: freeAccount.mnemonic
      };
    } catch (error) {
      console.error(error);
      return {
        status: 'error',
        message: 'error register function',
        mnemonic: ''
      };
    }
  }
}
