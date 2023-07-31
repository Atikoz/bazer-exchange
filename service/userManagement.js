const UserModel = require('../model/modelUser.js');
const WalletUserModel = require('../model/modelWallet.js');
const BalanceUserModel = require('../model/modelBalance.js');

class UserManagement {
  async getInfoUser(userId) {
    try {
      const user = await UserModel.findOne({id: userId});
      if (!user) return "not user";

      const userBalance = await BalanceUserModel.findOne({id: userId});
      const userWallet = await WalletUserModel.findOne({id: userId});
      return {
        user,
        userBalance,
        userWallet,
      };
    } catch (error) {
      console.error(error)
    }
  };
}

module.exports = new UserManagement();