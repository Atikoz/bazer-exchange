import axios from 'axios';

interface KeysMinePlex {
  keys: {
    pkh: string,
    sk: string,
    pk: string
  }
}

interface DataMinePlexWallet {
  data: KeysMinePlex
}

async function CreateMinePlexWallet(mnemonic: string): Promise<DataMinePlexWallet> {
  try {
    const createWallet = await axios({
      method: 'post',
      url: 'https://mineplexapi.bazerwallet.com/mineplex/api/v1/generateKeys',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: { mnemonic }
    });

    return createWallet.data

  } catch (error) {
    console.error(error);
    return {
      data: {
        keys: {
          pkh: 'null',
          sk: 'null',
          pk: 'null'
        }
      }
    }
  }
};

export default CreateMinePlexWallet;