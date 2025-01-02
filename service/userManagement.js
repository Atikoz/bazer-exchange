const UserModel = require('../model/user/modelUser.js');
const WalletUserModel = require('../model/user/modelWallet.js');
const BalanceUserModel = require('../model/user/modelBalance.js');

class UserManagement {
  async getInfoUser(userId) {
    try {
      const user = await UserModel.findOne({id: userId});

      if (!user) {
        return {
          status: false,
          user: null,
          userBalance: null,
          userWallet: null,
        };
      }

      const userBalance = await BalanceUserModel.findOne({id: userId});
      const userWallet = await WalletUserModel.findOne({id: userId});

      return {
        status: true,
        user,
        userBalance,
        userWallet,
      };
    } catch (error) {
      console.error(error);

      return {
        status: false,
        user: null,
        userBalance: null,
        userWallet: null,
      };
    }
  };
}

module.exports = new UserManagement();
