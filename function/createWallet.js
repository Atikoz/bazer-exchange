const axios = require ('axios');

const data = {
  status: 'error',
  del: {
    address: '',
    mnemonics: '',
  }
}
module.exports = async function CreateWallet() {
  const createDelWallet = await axios.post('https://cryptoapi7.ru/api/v1/createWallet');
  if (createDelWallet.status != 200) return CreateWallet();

  data.status = 'ok';
  data.del.address = createDelWallet.data.result.result.address;
  data.del.mnemonics = createDelWallet.data.result.result.mnemonics;

  return data;
}