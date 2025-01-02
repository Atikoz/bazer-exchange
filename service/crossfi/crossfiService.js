const { StargateClient, SigningStargateClient, GasPrice, calculateFee } = require('@cosmjs/stargate');
const { DirectSecp256k1HdWallet, coin, decodeTxRaw } = require('@cosmjs/proto-signing');
const config = require('../../config');
const { stringToPath } = require('@cosmjs/crypto');
const toBaseUnit = require('../../helpers/toBaseUnit');
const CrossfiUserReplenishment = require('../../model/crossfi/CrossfiUserReplenishment');

const minimalSum = {
  xfi: 3,
  mpx: 5
}

const GAS_PRICE = {
  mpx: GasPrice.fromString('10000000000000mpx'),
  xfi: GasPrice.fromString('100000000000xfi'),
};

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
      await this.ensureInitialized();

      const sentTransactions = await this.client.searchTx([
        { key: "message.sender", value: address }
      ]);

      const receivedTransactions = await this.client.searchTx([
        { key: "transfer.recipient", value: address }
      ]);

      const allTransactions = [...sentTransactions, ...receivedTransactions];

      return allTransactions;

    } catch (error) {
      console.error('getUserTx', error);
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

      const response = await fetch(`https://cosmos-api.mainnet.ms/cosmos/bank/v1beta1/balances/${address}`, requestOptions);

      const resultApi = await response.json();

      console.log(resultApi)

      const result = {
        status: true,
        mpx: 0,
        xfi: 0
      };

      const coins = resultApi.balances;

      coins.forEach(coin => {
        if (coin.denom === "mpx") {
          result.mpx = +coin.amount || 0;
        } else if (coin.denom === "xfi") {
          result.xfi = +coin.amount || 0;
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

  async calculateFeeTx(recipient, mnemonic, denom, amountToSend) {
    const GAS_PRICE = {
      mpx: GasPrice.fromString('10000000000000mpx'),
      xfi: GasPrice.fromString('100000000000xfi'),
    };

    let gasPrice = GAS_PRICE[denom];

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

    const [oldAddressAccountData, newAddressAccountData] = await signer.getAccounts();

    console.log('old address:', oldAddressAccountData.address);
    console.log('new address:', newAddressAccountData.address);

    const message = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress: newAddressAccountData.address,
        toAddress: recipient,
        amount: [coin(toBaseUnit(amountToSend), denom)],
      },
    };


    const gasEstimate = await signingClient.simulate(newAddressAccountData.address, [message], '');
    const gasLimit = Math.round(gasEstimate * '1.4');
    const stdFee = calculateFee(gasLimit, gasPrice);

    return +stdFee.amount[0].amount / 1e18
  }

  async sendCoin(recipient, mnemonic, denom, amountToSend) {
    try {
      let gasPrice = GAS_PRICE[denom];

      const clientOptions = {
        gasPrice,
        broadcastTimeoutMs: 20000,
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

      const [oldAddressAccountData, newAddressAccountData] = await signer.getAccounts();

      console.log('old address:', oldAddressAccountData.address);
      console.log('new address:', newAddressAccountData.address);

      const message = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: newAddressAccountData.address,
          toAddress: recipient,
          amount: [coin(toBaseUnit(amountToSend), denom)],
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
        tx: tx
      }
    } catch (error) {
      console.error('error send function crossfi: ', error);

      if (error.name === 'TimeoutError') {
        return {
          status: true,
          tx: null
        }
      }

      return {
        status: false,
        tx: null
      }
    }
  }

  async sendCoin2(recipient, mnemonic, denom, amountToSend) {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      
      const urlencoded = new URLSearchParams();
      urlencoded.append("fromMnemonic", mnemonic);
      urlencoded.append("toAddress", recipient);
      urlencoded.append("amount", amountToSend);
      urlencoded.append("denom", denom);
      urlencoded.append("memo", "Перевод бота BAZER EXCHANGE: https://t.me/bazerp2p_bot");
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      };
      
      const responce = await fetch("https://mpxapi.bazerwallet.com/mpx/api/v1/send", requestOptions);

      const resultApi = await responce.json();

      console.log(resultApi)

      return {
        code: resultApi.data.code || 999,
        hash: resultApi.data.transactionHash || ''
      }
    } catch (error) {
      console.error(error);

      return {
        code: 0,
        hash: ''
      }
    }
  }

  getTxData(rawLog) {
    const parsedLogs = JSON.parse(rawLog);

    const coinSpent = parsedLogs[0].events.find((item) => item.type === 'coin_spent');
    const transfer = parsedLogs[0].events.find((item) => item.type === 'transfer');

    const amountArr = transfer.attributes.filter((item) => item.key === 'amount')
    const [amount, coin] = amountArr[0].value.split(/(?<=\d)(?=\D)/);

    const sender = coinSpent.attributes[0].value;

    return {
      sender,
      amount,
      coin
    }
  }

  async validateTx(userWallet, hash, sender, amount, coin) {
    amount = amount / 1e18;

    try {
      const isTransaction = await CrossfiUserReplenishment.findOne({ hash: hash });

      if (isTransaction) {
        throw new Error('transaction is in the database')
      }

      if (userWallet === sender) {
        throw new Error('transfer transaction to admin wallet')
      }

      if (amount < minimalSum[coin]) {
        throw new Error('replenishment less than the minimum amount')
      }

      if (!(coin === 'mpx' || coin === 'xfi')) {
        throw new Error('unavailable coins')
      }

      return true
    } catch (error) {
      return false
    }
  }
}

module.exports = CrossfiService;