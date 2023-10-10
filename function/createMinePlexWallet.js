const axios = require ('axios');

async function CreateMinePlexWallet(mnemonic) {
  try {
    const createWallet = await axios({
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://mineplexapi.bazerwallet.com/mineplex/api/v1/generateKeys',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : { mnemonic }
    });


    console.log(mnemonic);
    console.log(createWallet.data);
    return createWallet.data

  } catch (error) {
    console.error(error)
  }
};

module.exports = CreateMinePlexWallet;