const axios = require('axios');
const qs = require('qs');


const CreateMpxXfiWallet = async (mnemonic) => {
  try {
    let data = qs.stringify({
      'mnemonic': `${mnemonic}`
    });

    console.log(mnemonic);
    
    let config = {
      method: 'post',
      url: 'https://mpxapi.bazerwallet.com/mpx/api/v1/account',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : data
    };
    
    return axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return response.data
    })
  } catch (error) {
    console.error(error)
  }
};

module.exports = CreateMpxXfiWallet;