import mongoose from "mongoose";
import BalanceUser from "../../models/user/BalanceModel";
import FreeAccount from "../../models/user/FreeAccountModel";
import ProfitPool from "../../models/user/ProfitPoolModel";
import User from "../../models/user/UserModel";
import WalletUser from "../../models/user/WalletUser";
import BotService from "../telegram/BotService";
import { FreeAccountService } from "./FreeAccountService";
import UserProvisioningService from "./UserProvisioningService";

interface ResultRegisterUser {
  status: string;
  message: string;
  mnemonic: string;
}

export class UserRegistrationService {
  static async registerUser(userId: number, email: string | null = null, bazerId: string): Promise<ResultRegisterUser> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [existingUser, freeAccount] = await Promise.all([
        User.findOne({ id: userId }).session(session),
        FreeAccount.findOneAndUpdate(
          { busy: false },
          { busy: true },
          { session, new: true })
      ]);

      if (existingUser) {
        const walletUser = await WalletUser.findOne({ id: userId }).session(session);
        return {
          status: 'ok',
          message: 'user registered',
          mnemonic: walletUser?.mnemonic || ''
        };
      }

      if (!freeAccount) {
        console.log('karau')
        await session.abortTransaction();
        return UserProvisioningService.createUserWithWallets(userId, email, bazerId);
      }

      await User.create([{ id: userId, bazerId, mail: email }], { session });
      await ProfitPool.create([{ id: userId }], { session });

      await WalletUser.create([{
        id: userId,
        mnemonic: freeAccount.mnemonic,
        del: freeAccount.del,
        usdt: freeAccount.usdt,
        crossfi: freeAccount.crossfi,
        artery: freeAccount.artery,
        minter: freeAccount.minter
      }], { session });

      await BalanceUser.create([{ id: userId }], { session });
      await FreeAccountService.delete(freeAccount.mnemonic, session);

      await session.commitTransaction();
      session.endSession();

      await BotService.sendLog(`Пользовaтель ${userId} зaрегестрировaлся в боте. Добро пожaловaть!`);

      return {
        status: 'ok',
        message: 'user registered successfully',
        mnemonic: freeAccount.mnemonic
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error('Error in register user', error);

      return {
        status: 'error',
        message: 'error register function',
        mnemonic: ''
      };
    }
  }
}
