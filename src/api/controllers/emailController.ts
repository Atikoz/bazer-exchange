import MailService from '../../service/mail/serviceMail'
import { Request, Response } from 'express';


interface SendCodeResponse {
  status: boolean;
  message: string;
  code: number;
}

interface SendCodeRequestBody {
  email: string;
}

interface VerifyCodeRequestBody {
  email: string;
  code: number;
}

class VerificationService {
  private verificationCodes: Map<string, number> = new Map();
  
  constructor() {
    this.sendVerificationCode = this.sendVerificationCode.bind(this);
  }

  async sendVerificationCode(req: Request<{}, {}, SendCodeRequestBody>, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const sendCode: SendCodeResponse = await MailService.sendConfirmationEmail(email);

      const statusSend = sendCode.status;
      const message = sendCode.message;

      if (statusSend) {
        this.verificationCodes.set(email, sendCode.code);

        res.status(200).json({
          error: '',
          message: message
        });
      } else {
        res.status(500).json({
          error: 'Error send code',
          message: message
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Error send code',
        message: error.message
      });
    }
  };

  async verifyCode(req: Request<{}, {}, VerifyCodeRequestBody>, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;
      
      if (!this.verificationCodes.has(email)) {
        res.status(400).json({
          status: false,
          message: 'no code found or any strings attached.'
        });

        return
      }

      if (this.verificationCodes.get(email) === code) {
        this.verificationCodes.delete(email);
        
        res.status(200).json({
          status: true,
          message: 'code confirmed'
        });

        return
      }

      res.status(400).json({
        status: false,
        message: 'invalid code'
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message
      });
    }
  };
}


export default VerificationService
