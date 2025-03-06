const MailService = require('../../function/mail/serviceMail');


const verificationCodes = new Map();

class VerificationService {
  sendVerificationCode = async (req, res) => {
    try {
      const { email } = req.body;

      const sendCode = await MailService.sendConfirmationEmail(email);

      const statusSend = sendCode.status;
      const code = sendCode.code;
      const message = sendCode.message;

      if (statusSend) {
        verificationCodes.set(email, sendCode.code);

        res.status(200).json({
          error: '',
          message: message,
          data: {
            code: code,
          },
        });
      } else {
        res.status(500).json({
          error: 'Error send code',
          message: message,
          data: {
            code: ''
          }
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Error send code',
        message: error.message,
        data: {
          code: ''
        }
      });
    }
  };

  verifyCode = async (req, res) => {
    try {
      const { email, code } = req.body;
      
      console.log(verificationCodes)

      if (!verificationCodes.has(email)) {
        return res.status(400).json({
          status: false,
          message: 'no code found or any strings attached.'
        });
      }

      if (verificationCodes.get(email) === code) {
        verificationCodes.delete(email);
        return res.status(200).json({
          status: true,
          message: 'code confirmed'
        });
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


module.exports = new VerificationService
