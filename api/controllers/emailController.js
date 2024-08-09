const { sendConfirmationEmail } = require("../../function/mail/serviceMail");

const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const sendCode = await sendConfirmationEmail(email);

    const statusSend = sendCode.status;
    const code = sendCode.code;
    const message = sendCode.message;

    if (statusSend) {
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

module.exports = {
  sendVerificationCode
};
