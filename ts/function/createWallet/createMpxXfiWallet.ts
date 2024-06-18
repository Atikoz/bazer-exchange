import axios from 'axios';
import qs from 'qs';

interface DataMpxXfiWallet {
  data: {
    account: {
      address: string
    }
  }
};

const CreateMpxXfiWallet = async (mnemonic: string): Promise<DataMpxXfiWallet> => {
  try {
    const data = qs.stringify({
      'mnemonic': `${mnemonic}`
    });
    
    const config = {
      method: 'post',
      url: 'https://mpxapi.bazerwallet.com/mpx/api/v1/account',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : data
    };
    
    return axios.request(config)
    .then((response) => {
      return response.data
    })
  } catch (error) {
    console.error(error)
    return {
      data: {
        account: {
          address: 'null'
        }
      }
    }
  }
};

export default CreateMpxXfiWallet;