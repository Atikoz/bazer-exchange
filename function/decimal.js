const { Wallet, DecimalEVM, DecimalNetworks } = require("dsc-js-sdk");

async function SendCoin(mnemonic, wallet, coin, amount) {
  try {
    const decimalWallet = new Wallet(mnemonic);
    const decimalEVM = new DecimalEVM(decimalWallet, DecimalNetworks.devnet);

    await decimalEVM.connect('contract-center');
    const sendAmount = decimalEVM.parseEther(amount);

    if (coin === 'del') {
      console.log('wallet', wallet);
      const sendDel = await decimalEVM.sendDEL(wallet, sendAmount)
      console.log('sendDel', sendDel);

      return sendDel
    } else {
      const tokenAddress = await decimalEVM.getAddressTokenBySymbol(coin.toUpperCase());
      console.log('tokenAddress', tokenAddress);

      const tx = await decimalEVM.approveToken(tokenAddress, wallet, sendAmount);
      console.log(tx);

      return tx
    }

  } catch (error) {
    console.error('send decimal coin error:', error)
  }
};

async function TransferCommission(mnemonics, wallet, coin, amount) {
  try {
    if (coin === 'cashback') return 15

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mnemonics: `${mnemonics}`,
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

async function getUserTx(address) {
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


module.exports = {
  SendCoin,
  TransferCommission,
  getUserTx
};
