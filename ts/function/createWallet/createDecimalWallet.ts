import axios from 'axios';

interface DataWallet {
  status: string,
  del: {
    address: string,
    mnemonics: string,
  }
}

const data: DataWallet = {
  status: 'error',
  del: {
    address: '',
    mnemonics: '',
  }
}
async function createDecimalWallet(): Promise<DataWallet> {
  const createDelWallet = await axios.post('https://cryptoapi7.ru/api/v1/createWallet');
  if (createDelWallet.status != 200) return createDecimalWallet();

  data.status = 'ok';
  data.del.address = createDelWallet.data.result.result.address;
  data.del.mnemonics = createDelWallet.data.result.result.mnemonics;

  return data;
}

export default createDecimalWallet;