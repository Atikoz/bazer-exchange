const axios = require('axios');
const { Minter, TX_TYPE } = require("minter-js-sdk");

const minter = new Minter({ apiType: 'node', baseURL: 'http://api-minter.mnst.club:8843/v2/' });
const seedTestAcc = 'ordinary client target bounce cinnamon trumpet crumble cactus junk music shoot elbow';

class MinterTransaction {
  sendBip = async (address, amount, seed = seedTestAcc) => {
    try {
      const txParams = {
        type: TX_TYPE.SEND,
        data: {
          to: `${address}`,
          value: `${amount}`,
          coin: 0, // coin id
        }
      };

      const sendRequest = await minter.postTx(txParams, { seedPhrase: seed });

      return { status: true, hash: sendRequest.hash };

    } catch (error) {
      console.error(error);
      return { status: false, error: error.response.data.error.message };

    }
  };

  getCommissionTx = async (address, amount) => {
    try {
      const txParams = {
        type: TX_TYPE.SEND,
        data: {
          to: `${address}`,
          value: `${amount}`,
          coin: 0, // coin id
        }
      };

      const feeData = await minter.estimateTxCommission(txParams);

      return feeData.commission
    } catch (error) {
      console.error(error)
    }
  }

  checkMinterHash = async (hash) => {
    try {
      const config = {
        method: 'get',
        url: `http://api-minter.mnst.club:8843/v2/transaction/${hash}`,
        headers: {}
      };

      return axios.request(config)
        .then((response) => {
          return response.data
        });
    } catch (error) {
      console.error(error)
    }
  };

  getTransaction = async (address) => {
    const request = await axios.get(`https://explorer-api.minter.network/api/v2/addresses/${address}/transactions`);

    const arrayTx = request.data.data;

    return arrayTx
  };

};

module.exports = new MinterTransaction;