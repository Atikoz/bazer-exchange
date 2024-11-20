const { StargateClient, SigningStargateClient, GasPrice, calculateFee } = require('@cosmjs/stargate');
const { DirectSecp256k1HdWallet, coin } = require('@cosmjs/proto-signing');

const config = require('../../config');
const { stringToPath } = require('@cosmjs/crypto');

class CrossfiService {
  rpcUrl
  client

  constructor() {
    this.rpcUrl = config.crossfiRpcUrl;
    this.client = null;
  }

  async initialize() {
    try {
      this.client = await StargateClient.connect(this.rpcUrl);
    } catch (error) {
      console.error('initialize rpc connection error:', error)
    }
  }

  async ensureInitialized() {
    if (!this.client) {
      await this.initialize();
    }
  }

  async getUserTx(address) {
    try {
      // await this.ensureInitialized();
      // console.log('address', address);

      // const sentTransactions = await this.client.searchTx([
      //   { key: "message.sender", value: address }
      // ]);

      // const receivedTransactions = await this.client.searchTx([
      //   { key: "transfer.recipient", value: address }
      // ]);

      // const allTransactions = [...sentTransactions, ...receivedTransactions];

      // console.log(allTransactions);

      // return allTransactions;

      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      const response = await fetch(`https://xfiscan.com/api/1.0/txs?address=${address}&page=1&limit=10&sort=-hieght`, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP checkTxHash crossfi error! Status: ${response.status}`);
      }

      const resultApi = await response.json();

      return resultApi.docs

    } catch (error) {
      console.error(error);
      return []
    }
  }

  async checkTxHash(hash) {
    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      const response = await fetch(`${this.rpcUrl}/tx?hash=0x${hash}&prove=true`, requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP checkTxHash crossfi error! Status: ${response.status}`);
      }

      const data = await response.json();

      return data.result

    } catch (error) {
      console.error(error)
    }
  }

  async getBalance(address) {
    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      const response = await fetch(`https://xfiscan.com/api/1.0/addresses/${address}`, requestOptions);

      const resultApi = await response.json();

      const result = {
        status: true,
        mpx: 0,
        xfi: 0
      };

      const coins = resultApi.coins;

      coins.forEach(coin => {
        if (coin.denom === "mpx") {
          result.mpx = coin.amount;
        } else if (coin.denom === "xfi") {
          result.xfi = coin.amount;
        }
      });

      return result

    } catch (error) {
      console.error('checkBalance crossfi error:', error);

      return {
        status: false,
        mpx: 0,
        xfi: 0
      }
    }
  }

  async createWallet(mnemonic) {
    try {
      const HD_PATHS = [stringToPath("m/44'/118'/0'/0/0"), stringToPath("m/44'/60'/0'/0/0")];

      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: "mx",
        hdPaths: HD_PATHS,
      });

      const [oldAddressAccountData, newAddressAccountData] = await wallet.getAccounts();

      console.log('------------------');
      console.log('old address:', oldAddressAccountData.address);
      console.log('new address:', newAddressAccountData.address);
      console.log('------------------');

      return {
        status: true,
        address: newAddressAccountData.address
      }
    } catch (error) {
      console.error('error create crossfi wallet:', error);
      return {
        status: false,
        address: ''
      }
    }
  }

  async sendCoin(recipient, mnemonic, denom, amountToSend) {
    try {
      const GAS_PRICE = {
        mpx: GasPrice.fromString('10000000000000mpx'),
        xfi: GasPrice.fromString('100000000000xfi'),
      };
  
      let gasPrice = GAS_PRICE.mpx;
  
      const clientOptions = {
        gasPrice,
        broadcastTimeoutMs: 5000,
        broadcastPollIntervalMs: 1000,
      };
  
      const PREFIX = 'mx';
      const HD_PATHS = [stringToPath("m/44'/118'/0'/0/0"), stringToPath("m/44'/60'/0'/0/0")];
  
      const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,
        {
          prefix: PREFIX,
          hdPaths: HD_PATHS
        });
  
      const signingClient = await SigningStargateClient.connectWithSigner(this.rpcUrl, signer, clientOptions);
      const [newAddressAccountData] = await signer.getAccounts();
  
      const message = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: newAddressAccountData.address,
          toAddress: recipient,
          amount: [coin(amountToSend, denom)], // amountToSend надо сделать числом блокчейна
        },
      };
  
      const gasEstimate = await signingClient.simulate(newAddressAccountData.address, [message], '');
      const gasLimit = Math.round(gasEstimate * '1.4');
      const stdFee = calculateFee(gasLimit, gasPrice);
      console.log('stdFee', stdFee);
  
      const tx = await signingClient.signAndBroadcast(newAddressAccountData.address, [message], stdFee, 'Перевод бота BAZER EXCHANGE: https://t.me/bazerp2p_bot');
      console.log('tx', tx);

      return {
        status: true,
        hash: tx
      }
    } catch (error) {
      console.error('error send function crossfi: ', error);

      return {
        status: false,
        hash: ''
      }
    }
  }

}

module.exports = new CrossfiService;