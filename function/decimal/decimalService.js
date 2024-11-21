import pkg, { Subgraph } from 'dsc-js-sdk'
const { Wallet, DecimalEVM, DecimalNetworks } = pkg;


class DecimalService {
  async SendCoin(address, amountToSend, coin, mnemonic) {
    try {
      const decimalWallet = new Wallet(mnemonic);
      const decimalEVM = new DecimalEVM(decimalWallet, DecimalNetworks.mainnet);
      const subgraph = new Subgraph(DecimalNetworks.mainnet)

      await decimalEVM.connect('contract-center');
      await decimalEVM.connect('token-center');
      const amount = decimalEVM.parseEther(amountToSend);

      if (coin === 'del') {
        console.log('address', address);
        const txSendDel = await decimalEVM.sendDEL(address, amount)
        console.log('send del tx - ', txSendDel);

        return {
          status: true,
          tx: txSendDel
        }
      } else {
        const tokenAddress = await subgraph.getTokenBySymbol(coin);
        const txSendToken = await decimalEVM.transferToken(tokenAddress, address, amount);
        console.log(`send ${coin} tx - ${txSendToken}`);

        return {
          status: true,
          tx: txSendToken
        }
      }
    } catch (error) {
      console.error('Error send del:', error);

      return {
        status: false,
        tx: null
      }
    }
  }

  //TODO: сделать апи
  async getUserTx(address) {
    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };
  
      const apiUrl = `https://mainnet-explorer-api.decimalchain.com/api/address/${address}/txs?limit=10&offset=0`;
  
      const response = await fetch(apiUrl, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const resultApi = await response.json();
      const arrayTx = resultApi.result.txs
  
      return arrayTx
  
    } catch (error) {
      if (error.name === 'ECONNABORTED') {
        console.error('Request timed out');
      } else {
        console.error('An error occurred:', error.message);
      }
    }
  }

  async getTransferCommission(mnemonic, wallet, coin, amount) {
    try {
      if (coin === 'cashback') return 15
  
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mnemonics: `${mnemonic}`,
          transaction: {
            network: 'mainnet',
            isNodeDirectMode: false,
            options: {
              customNodeEndpoint: {
                nodeRestUrl: 'http://127.0.0.1:1317',
                rpcEndpoint: 'http://127.0.0.1:26657',
                web3Node: 'http://127.0.0.1:12289',
              },
            },
          },
          options: {
            simulate: true,
            feeCoin: `${coin}`,
          },
          payload: {
            recipient: `${wallet}`,
            denom: `${coin}`,
            amount: `${amount}`,
          },
        }),
      };
  
      const response = await fetch(`https://cryptoapi7.ru/api/v1/sendCoins`, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      const commission = result.result.result.amount / 1e18;
      
      return commission;
  
    } catch (error) {
      console.error('del transfer comission calculation error: ', error.message);
    }
  };


}

module.exports = new DecimalService;