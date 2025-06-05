import ExchangeStatus from "../../../models/decimal/modelExchangeStatus";
import BalanceUser from "../../../models/user/BalanceModel";
import { fromBaseUnit } from "../../../utils/unitConversion";
import BalanceService from "../../balance/BalanceService";
import BotService from "../../telegram/BotService";


class DecimalExchangeService {
  async getRate(coinSell: string, coinBuy: string): Promise<number | null> {
    try {
      if (coinSell === 'del') {
        const res = await fetch(`https://api.decimalchain.com/api/v1/coins/${coinBuy}`);
        const data = await res.json();

        const rateRaw = data.Result[0].current_price;
        const rate = +fromBaseUnit(rateRaw);


        return rate ? (1 / rate) * 0.95 : null;
      }

      if (coinBuy === 'del') {
        const res = await fetch(`https://api.decimalchain.com/api/v1/coins/${coinSell}`);
        const data = await res.json();

        const rateRaw = data.Result[0].current_price;
        const rate = +fromBaseUnit(rateRaw);

        return rate ? rate * 0.95 : null;
      }

      const [resSell, resBuy] = await Promise.all([
        fetch(`https://api.decimalchain.com/api/v1/coins/${coinSell}`),
        fetch(`https://api.decimalchain.com/api/v1/coins/${coinBuy}`),
      ]);

      const dataSell = await resSell.json();
      const dataBuy = await resBuy.json();

      const rateSellRaw = dataSell.Result[0].current_price;
      const rateBuyRaw = dataBuy.Result[0].current_price;

      const rateSell = +fromBaseUnit(rateSellRaw);
      const rateBuy = +fromBaseUnit(rateBuyRaw);

      return (rateSell / rateBuy) * 0.95;
    } catch (error) {
      console.error('[DecimalExchangeService] Error fetching rate:', error);
      return null;
    }
  }

  async checkStatus(userId: number, hash: string, coinSell: string, coinBuy: string): Promise<void> {
    try {
      const res = await fetch(`https://mainnet-explorer-api.decimalchain.com/api/tx/${hash}`);
      const data = await res.json();
      if ('statusCode' in data) return;

      const result = data.result;

      if (result.status === 'Success') {
        const amountSell = result.data.max_amount_to_sell / 1e18;
        const amountBuy = result.data.amount_to_buy / 1e18;
        const gas = result.fee.data.gas_amount / 1e18;

        await BalanceService.updateBalance(userId, coinSell, -amountSell);
        await BalanceService.updateBalance(userId, coinBuy, amountBuy);
        await BalanceService.updateBalance(userId, 'del', -gas);

        await ExchangeStatus.updateOne({ hash }, { $set: { status: 'Done', processed: true } });

        const message = `Вы обменяли ${amountSell} ${coinSell.toUpperCase()} на ${amountBuy} ${coinBuy.toUpperCase()} ✅\nTxHash:<code>${hash}</code>`;
        await BotService.sendMessage(userId, message, { parseMode: 'html' });
        await BotService.sendLog(`Пользователь ${userId} обменял ${amountSell} ${coinSell.toUpperCase()} на ${amountBuy} ${coinBuy.toUpperCase()} ✅\nTxHash:<code>${hash}</code>`);
      }

      if (result.status === 'Fail') {
        await ExchangeStatus.updateOne({ hash }, { $set: { status: 'Fail', processed: true } });
        await BotService.sendMessage(userId, `При обмене возникла ошибка!\nTxHash: <code>${hash}</code>`);
      }
    } catch (error) {
      console.error('[DecimalExchangeService] Error checking status:', error);
    }
  }

  async simulateExchange(mnemonic: string, sellCoin: string, buyCoin: string, amountBuy: string, amountSell: string) {
    return this.callAPI(mnemonic, sellCoin, buyCoin, amountBuy, amountSell, true);
  }

  async executeExchange(mnemonic: string, sellCoin: string, buyCoin: string, amountBuy: string, amountSell: string) {
    return this.callAPI(mnemonic, sellCoin, buyCoin, amountBuy, amountSell);
  }

  private async callAPI(mnemonic: string, sellCoin: string, buyCoin: string, amountBuy: string, amountSell: string, simulate: boolean = false) {
    try {
      const payload = {
        mnemonics: mnemonic,
        transaction: {
          network: 'mainnet',
          isNodeDirectMode: false,
          options: {
            customNodeEndpoint: {
              nodeRestUrl: 'http://127.0.0.1:1317',
              rpcEndpoint: 'http://127.0.0.1:26657',
              web3Node: 'http://127.0.0.1:12289'
            }
          }
        },
        options: { simulate },
        payload: {
          denomSell: sellCoin,
          denomBuy: buyCoin,
          amountBuy,
          amountSell
        }
      };

      const res = await fetch('https://cryptoapi7.ru/api/v1/buyCoin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return await res.json();
    } catch (error) {
      console.error(`[DecimalExchangeService] ${simulate ? 'Simulation' : 'Execution'} error:`, error);
      return null;
    }
  }
}

export const decimalExchangeService = new DecimalExchangeService();
