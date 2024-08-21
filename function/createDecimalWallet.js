const axios = require('axios');

module.exports = async function createDecimalWallet() {
  try {
    const { data: { result: { result: { address, mnemonics } } } } = await axios.post('https://cryptoapi7.ru/api/v1/createWallet');
    return { status: 'ok', del: { address, mnemonic: mnemonics } };
  } catch (error) {
    console.error('Error creating wallet:', error.message);
    return createDecimalWallet();
  }
}
