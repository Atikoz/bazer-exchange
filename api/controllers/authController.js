const { encrypt } = require('../../helpers/encryptionFunction.js');
const AuthenticationService = require('../../service/auth.js');

const register = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const result = await AuthenticationService.Authentication(userId, email);
    const message = result.message

    if (result.status === 'error') throw new Error(result.message)
    
    res.status(200).json({
      status: 'ok',
      error: '',
      message: message,
      data: {
        userId: userId,
        email: email,
        mnemonic: encrypt(result.mnemonic)
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

module.exports = {
  register
};
