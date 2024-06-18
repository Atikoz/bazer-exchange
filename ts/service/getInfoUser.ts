import WalletUserModel from '../model/modelWallet.js';
import BalanceUserModel from '../model/modelBalance.js';
import UserModel from '../model/modelUser.js';

async function getInfoUser(userId: number): Promise<any> {
  try {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return "not user";

    const userBalance = await BalanceUserModel.findOne({ id: userId });
    const userWallet = await WalletUserModel.findOne({ id: userId });

    return {
      user,
      userBalance,
      userWallet,
    };
  } catch (error) {
    console.error(error);
  }
};

export default getInfoUser;