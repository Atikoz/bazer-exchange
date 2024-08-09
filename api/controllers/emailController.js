
const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const code = 'sadasdas';
    const message = 'done';

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
