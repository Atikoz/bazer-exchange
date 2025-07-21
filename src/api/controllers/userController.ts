import { Request, Response } from 'express';
import EncryptionService from '../../service/security/EncryptionService';
import { UserRegistrationService } from '../../service/user/UserRegistrationService';
import UserManagement from '../../service/user/UserManagement';

const ENCRYPTION_KEY_MICROSERVICE = process.env.ENCRYPTION_KEY_MICROSERVICE;

interface RegisterRequestBody {
  userId: number;
  email: string;
  bazerId: string;
  refferId: string;
}

class UserController {
  // payWithBot = async (req, res) => {
  //   try {
  //     const { userId, amount, coin, p2pKey } = req.body;
  
  //     const userData = await getInfo(userId);
  
  //     if (!userData.status) {
  //       throw new Error('error geting info user')
  //     }
  
  //     const balanceUser = userData.userBalance.main;
  //     const encryptMemonic = userData.userWallet.mnemonic;
  //     const mnemonicUser = encryptionService.decryptSeed(encryptMemonic);
  //     const decryptedSeed = encryptionService.decryptSeed(p2pKey, config.encryptionKeyMicroservice);
      
  //     if (mnemonicUser !== decryptedSeed.trim()) {
  //       throw new Error('invalid seed phrase');
  //     }
  
  //     if (balanceUser[coin] < amount) {
  //       throw new Error('insufficient funds on balance');
  //     }
  
  //     await ControlUserBalance(userId, coin, -amount);
  
  //     res.status(200).json({
  //       status: 'ok',
  //       error: '',
  //       data: {
  //         user: userId,
  //         amountPay: amount,
  //         coinPay: coin
  //       },
  //       message: 'payment successful',
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       status: 'error',
  //       error: 'error during payment',
  //       data: {},
  //       message: error.message,
  //     });
  //   }
  // };

  async register(req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> {
    try {
      const { userId, email, bazerId, refferId } = req.body;

      const result = await UserRegistrationService.registerUser(userId, email, bazerId);
      const message = result.message;
  
      if (result.status === 'error') {
        throw new Error(result.message)
      }
    
      res.status(200).json({
        status: 'ok',
        error: '',
        message: message,
        data: {
          userId: userId,
          email: email,
          mnemonic: result.mnemonic
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'Error registering user',
        message: error.message,
        data: {}
      });
    }
  };

  async getBalanceUser(req: Request<{ userId: number }>, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const fetchUserInfo = await UserManagement.getInfoUser(userId);
  
      if(!fetchUserInfo.status) {
        throw new Error(fetchUserInfo.error);
      }
  
      res.status(200).json({
        status: 'ok',
        error: '',
        data: {
          user: userId,
          balance: fetchUserInfo.userBalance.main
        },
        message: 'done',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'error get balance',
        message: error.message,
        data: {}
      });
    }
  }
}
 

export default new UserController;
