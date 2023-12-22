const axios = require('axios');
const qs = require('qs');



const getMinePlexTransactions = async (wallet) => {
  try {
    const userTransactionMinePlex = await axios({
      method: 'get',
      url: `https://explorer.mineplex.io/api/transactions?$limit=1000&$skip=0&$sort[blockLevel]=-1&$sort[counter]=-1&$or[0][source]=${wallet}&$or[1][destination]=${wallet}&type[]=plex&type[]=mine`,
      headers: { }
    });

    return userTransactionMinePlex.data
    
  } catch (error) {
    console.error(error)
  }
};

const checkHashSendAdminComission = async (hash) => {
  try {
    const chekHash = await axios({
      method: 'get',
      url: `https://explorer.mineplex.io/api/transactions?operationHash=${hash}`,
      headers: { }
    })

    console.log(chekHash.data);

    return chekHash.data.data[0].operationHash

  } catch (error) {
    console.error(error)
  }
};

const checkBalance = async (wallet) => {
  try {
    let data = qs.stringify({
      'pkh': `${wallet}`
    });
    
    const balance = await axios({
      method: 'post',
      url: 'https://mineplexapi.bazerwallet.com/mineplex/api/v1/balance',
      headers: { },
      data : data
    })

    return balance.data.data.balance[1].mine

  } catch (error) {
    console.error(error)
  }
};

const sendCoin = async (senderKey, recipientAddress, amount, coin) => {
  try {
    const requestData = {
      sk: senderKey,
      operations: [
        { to: recipientAddress, amount: amount, fee: 1, type: coin }
      ]
    };

    const sendRequest = await axios({
      method: 'post',
      url: 'https://mineplexapi.bazerwallet.com/mineplex/api/v1/sendOperation',
      headers: {},
      data: requestData
    });

    return sendRequest.data

  } catch (error) {
    console.error(error);
  }
};



module.exports = {
  getMinePlexTransactions,
  checkHashSendAdminComission,
  checkBalance,
  sendCoin
};