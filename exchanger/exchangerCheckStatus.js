const axios = require('axios');
const sendLog = require('../helpers/sendLog.js');
const ExchangeStatus = require('../model/modelExchangeStatus');
const BalanceUserModel = require('../model/modelBalance.js');
const sendMessage = require('../helpers/tgFunction.js');



class ExchangeCheckStatus {
  async ExchangeCheckHash(userId, hash, coinSell, coinBuy) {
    try {
      const exchangeHash = await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/tx/${hash}`);
      
      if (exchangeHash.data.hasOwnProperty('statusCode')) return;

      if (exchangeHash.data.result.status === "Success") {
        await BalanceUserModel.updateOne(
          {id: userId}, 
          JSON.parse(`{"$inc": { "main.${coinSell}": -${exchangeHash.data.result.data.max_amount_to_sell/1e18} }}`)
          );

        await BalanceUserModel.updateOne(
          {id: userId}, 
          JSON.parse (`{"$inc": { "main.${coinBuy}": ${exchangeHash.data.result.data.amount_to_buy/1e18} }}`)
          );

        await BalanceUserModel.updateOne(
          {id: userId}, 
          {$inc: { 'main.del': -(exchangeHash.data.result.fee.data.gas_amount/1e18)} }
          );

        await ExchangeStatus.updateOne(
          {hash: hash},
           {$set: {status: 'Done', processed: true}}
           );

        sendMessage(userId, `Вы обменяли ${exchangeHash.data.result.data.max_amount_to_sell/1e18} ${coinSell.toUpperCase()} на ${exchangeHash.data.result.data.amount_to_buy/1e18} ${coinBuy.toUpperCase()} ✅\nTxHash:<code>${hash}</code>`, { parseMode:'html' });
        return sendLog(`Пользователь ${userId} обменял ${exchangeHash.data.result.data.max_amount_to_sell/1e18} ${coinSell.toUpperCase()} на ${exchangeHash.data.result.data.amount_to_buy/1e18} ${coinBuy.toUpperCase()} ✅\nTxHash:<code>${hash}</code>`);
      }

      if (exchangeHash.data.result.status === "Fail") {
        await ExchangeStatus.updateOne(
          {hash: hash},
           {$set: {status: 'Fail', processed: true}}
           );
           
        return sendMessage(userId,`При обмене возникла ошибка!\nTxHash: <code>${hash}</code>`);
      }
    } catch (error) {
      console.error(error)
    }
  }
};

module.exports = new ExchangeCheckStatus;


