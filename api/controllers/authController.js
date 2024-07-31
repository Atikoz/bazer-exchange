const { encrypt } = require('../../helpers/encryptionFunction.js');
const AuthenticationService = require('../../service/auth.js');

const register = async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await AuthenticationService.Authentication(userId);

    if (result.status === 'error') throw new Error(result.message)
    
    res.status(201).json({
      error: '',
      message: 'User registered successfully',
      data: {
        userId: userId,
        mnemonic: encrypt(result.mnemonic)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error registering user',
      message: error.message,
      data: {}
    });
  }
};

module.exports = {
  register
};
