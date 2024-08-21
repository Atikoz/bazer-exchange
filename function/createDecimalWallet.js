const axios = require('axios');

module.exports = async function createDecimalWallet() {
  try {
    const { data: { result: { result: { address, mnemonic } } } } = await axios.post('https://cryptoapi7.ru/api/v1/createWallet');
    return { status: 'ok', del: { address, mnemonic } };
  } catch (error) {
    console.error('Error creating wallet:', error.message);
    return createDecimalWallet();
  }
}
