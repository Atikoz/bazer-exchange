const axios = require('axios');
const qs = require('qs');


const CreateMpxXfiWallet = async (mnemonic) => {
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
  }
};

module.exports = CreateMpxXfiWallet;