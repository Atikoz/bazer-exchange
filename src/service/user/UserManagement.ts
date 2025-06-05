import BalanceUser from "../../models/user/BalanceModel";
import User from "../../models/user/UserModel";
import WalletUser from "../../models/user/WalletUser";
import { Language } from "../../translations";

interface User {
  id: string;
  status: number;
  mail: string;
  lang: string;
}

interface TokenMap {
  [key: string]: number;
}

interface UserBalance {
  id: number;
  main: TokenMap;
  hold: TokenMap;
}

interface UserWallet {
  id: number,
  mnemonic: string,
  del: {
    address: string
  },
  usdt: {
    address: string,
    privateKey: string
  },
  crossfi: {
    address: string
  },
  artery: {
    address: string
  },
  minter: {
    address: string,
    privateKey: string
  }
}

interface GetInfoUser {
  status: boolean,
  error: string | null,
  user: User | null,
  userBalance: UserBalance | null,
  userWallet: UserWallet | null
}

class UserManagement {
  static async getInfoUser(userId: string | number): Promise<GetInfoUser> {
    try {
      const user = await User.findOne({ id: userId });

      if (!user) {
        return {
          status: false,
          error: 'User not found',
          user: null,
          userBalance: null,
          userWallet: null,
        };
      }

      const userBalance = await BalanceUser.findOne({ id: userId }).lean<UserBalance>();;
      const userWallet = await WalletUser.findOne({ id: userId }).lean<UserWallet>();;

      return {
        status: true,
        error: null,
        user,
        userBalance,
        userWallet,
      };
    } catch (error) {
      console.error(`error geting user info: `, error);

      return {
        status: false,
        error: 'Error getting user info',
        user: null,
        userBalance: null,
        userWallet: null,
      };
    }
  };

  static async setState(userId: number, state: number): Promise<void> {
    await User.updateOne(
      { id: userId },
      { $set: { status: state } }
    );
  };

  static async setLanguage(userId: number, lang: Language): Promise<void> {
    await User.updateOne(
      { id: userId },
      { $set: { lang } }
    );
  };
}

export default UserManagement