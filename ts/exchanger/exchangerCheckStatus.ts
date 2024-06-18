import axios from 'axios';
import BalanceUserModel from '../model/modelBalance';
import ExchangeStatus from '../model/decimal/modelExchangeStatus';
import sendMessage from '../helpers/sendMessage';
import sendLog from '../helpers/sendLog';

interface ExchangeCoinResultApi {
  data: {
    result: {
      status: string,
      data: {
        max_amount_to_sell: string,
        amount_to_buy: string
      },
      fee: {
        data: {
          gas_amount: string
        }
      }
    }
  }
}

async function DecimalExchangeCheckHash(userId: number, hash: string, coinSell: string, coinBuy: string): Promise<void> {
  try {
    const exchangeHash: ExchangeCoinResultApi = await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/tx/${hash}`);

    if (exchangeHash.data.hasOwnProperty('statusCode')) return;

    if (exchangeHash.data.result.status === "Success") {
      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "main.${coinSell}": -${+exchangeHash.data.result.data.max_amount_to_sell / 1e18} }}`)
      );

      await BalanceUserModel.updateOne(
        { id: userId },
        JSON.parse(`{"$inc": { "main.${coinBuy}": ${+exchangeHash.data.result.data.amount_to_buy / 1e18} }}`)
      );

      await BalanceUserModel.updateOne(
        { id: userId },
        { $inc: { 'main.del': -(+exchangeHash.data.result.fee.data.gas_amount / 1e18) } }
      );

      await ExchangeStatus.updateOne(
        { hash: hash },
        { $set: { status: 'Done', processed: true } }
      );

      sendMessage(userId, `Вы обменяли ${+exchangeHash.data.result.data.max_amount_to_sell / 1e18} ${coinSell.toUpperCase()} на ${+exchangeHash.data.result.data.amount_to_buy / 1e18} ${coinBuy.toUpperCase()} ✅\nTxHash:<code>${hash}</code>`);
      sendLog(`Пользователь ${userId} обменял $exchangeHash.data.result.data.max_amount_to_sell / 1e18} ${coinSell.toUpperCase()} на ${+exchangeHash.data.result.data.amount_to_buy / 1e18} ${coinBuy.toUpperCase()} ✅\nTxHash:<code>${hash}</code>`);
      return
    }

    if (exchangeHash.data.result.status === "Fail") {
      await ExchangeStatus.updateOne(
        { hash: hash },
        { $set: { status: 'Fail', processed: true } }
      );
      sendMessage(userId, `При обмене возникла ошибка!\nTxHash: <code>${hash}</code>`);
      return
    }
  } catch (error) {
    console.error(error)
  }
};

export default DecimalExchangeCheckHash;