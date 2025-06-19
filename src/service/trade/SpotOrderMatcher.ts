import CustomOrder from "../../models/spotTrade/modelOrder";
import BalanceUser from "../../models/user/BalanceModel";
import { MatchType } from "../../types/matchType";
import BotService from "../telegram/BotService";
import { SpotTradeFeeCalculator } from "../../utils/calculators/spotTradeFeeCalculator";

interface SpotOrder {
  id: string,
  orderNumber: number,
  status: string,
  sellCoin: string,
  buyCoin: string,
  buyAmount: number,
  sellAmount: number,
  rate: number,
  comission: number
}


class SpotOrderMatcher {
  public async processOrders(): Promise<void> {
    try {
      const listOrders = await CustomOrder.find({});
      const filtered = listOrders.filter(o => o.status !== 'Done' && o.status !== 'Deleted');

      for (let i = 0; i < filtered.length; i++) {
        for (let j = i + 1; j < filtered.length; j++) {
          const first: SpotOrder = filtered[i];
          const second: SpotOrder = filtered[j];

          const isMatch = (
            first.buyCoin === second.sellCoin &&
            first.sellCoin === second.buyCoin &&
            1 / first.rate === second.rate
          );

          if (!isMatch) {
            continue
          };

          if (first.buyAmount < second.sellAmount) {
            await this.handlePartialSell(first, second);
            return;
          } else if (first.buyAmount > second.sellAmount) {
            await this.handlePartialBuy(first, second);
            return;
          } else {
            await this.handleFullMatch(first, second);
            return;
          }
        }
      }
    } catch (error) {
      console.error(`Error cheking spot orders: `, error);
    }
  }

  private async handlePartialSell(first: SpotOrder, second: SpotOrder): Promise<void> {
    const buySumm = first.buyAmount;
    const sellSumm = first.sellAmount;

    const feeTrade = await SpotTradeFeeCalculator.calculatePartial(second.sellAmount, buySumm, second.comission, second.sellAmount, second.buyAmount);

    //начисление денег на балансы
    await this.updateHoldBalance(+first.id, first.sellCoin, -sellSumm);
    await this.updateMainBalance(+first.id, first.buyCoin, buySumm);

    await this.updateHoldBalance(+second.id, second.sellCoin, -buySumm);
    await this.updateMainBalance(+second.id, second.buyCoin, sellSumm);


    //комиссия
    await this.updateHoldBalance(+second.id, SpotTradeFeeCalculator.commissionCoin, -feeTrade);
    await this.updateHoldBalance(+first.id, SpotTradeFeeCalculator.commissionCoin, -first.comission);


    //обновление данных ордера
    await CustomOrder.updateOne(
      { id: first.id, orderNumber: first.orderNumber },
      { $set: { status: 'Done' } }
    );
    await CustomOrder.updateOne(
      { id: second.id, orderNumber: second.orderNumber },
      { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm, comission: -feeTrade } }
    );

    await this.notifyUsers(first, second, 'partialSell');
  }

  private async handlePartialBuy(first: SpotOrder, second: SpotOrder): Promise<void> {
    const buySumm = second.buyAmount;
    const sellSumm = second.sellAmount;
    const feeTrade = await SpotTradeFeeCalculator.calculatePartial(first.sellAmount, buySumm, first.comission, first.sellAmount, first.buyAmount);

    //начисление денег на балансы
    await this.updateHoldBalance(+second.id, second.sellCoin, -sellSumm);
    await this.updateMainBalance(+second.id, second.buyCoin, buySumm);

    await this.updateHoldBalance(+first.id, first.buyCoin, sellSumm);
    await this.updateMainBalance(+first.id, first.sellCoin, -buySumm);


    //комиссия
    await this.updateHoldBalance(+second.id, SpotTradeFeeCalculator.commissionCoin, -second.comission);
    await this.updateHoldBalance(+first.id, SpotTradeFeeCalculator.commissionCoin, -feeTrade);


    //обновление данных ордеров
    await CustomOrder.updateOne(
      { id: second.id, orderNumber: second.orderNumber },
      { $set: { status: 'Done' } }
    );
    await CustomOrder.updateOne(
      { id: first.id, orderNumber: first.orderNumber },
      { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm, comission: -feeTrade } }
    );

    await this.notifyUsers(first, second, 'partialBuy');
  }

  private async handleFullMatch(first: SpotOrder, second: SpotOrder): Promise<void> {
    //начисление денег на балансы
    await this.updateHoldBalance(+first.id, first.sellCoin, -first.sellAmount);
    await this.updateMainBalance(+first.id, first.buyCoin, first.buyAmount);

    await this.updateHoldBalance(+second.id, second.sellCoin, -second.sellAmount);
    await this.updateMainBalance(+second.id, second.buyCoin, second.buyAmount);


    //комиссия
    await this.updateHoldBalance(+first.id, SpotTradeFeeCalculator.commissionCoin, -first.comission);
    await this.updateHoldBalance(+second.id, SpotTradeFeeCalculator.commissionCoin, -second.comission);


    //обновление статусов ордеров
    await CustomOrder.updateOne(
      { id: second.id, orderNumber: second.orderNumber },
      { $set: { status: 'Done' } }
    );
    await CustomOrder.updateOne(
      { id: first.id, orderNumber: first.orderNumber },
      { $set: { status: 'Done' } }
    );

    await this.notifyUsers(first, second, 'full');
  }

  private async updateMainBalance(userId: number, coin: string, amount: number): Promise<void> {
    await BalanceUser.updateOne({ id: userId }, {
      $inc: { [`main.${coin}`]: amount }
    });
  }

  private async updateHoldBalance(userId: number, coin: string, amount: number): Promise<void> {
    await BalanceUser.updateOne({ id: userId }, {
      $inc: { [`hold.${coin}`]: amount }
    });
  }

  private async notifyUsers(first: SpotOrder, second: SpotOrder, type: MatchType): Promise<void> {
    switch (type) {
      case 'partialSell':
        BotService.sendMessage(first.id, `Ваш ордер №${first.orderNumber} был выполнен ✅`);
        BotService.sendMessage(second.id, `По вашему ордеру №${second.orderNumber} была выполнена продажа в размере ${first.buyAmount} ${(first.buyCoin).toUpperCase()}.\nДанные ордера №${second.orderNumber} были обновлены!`);

        await BotService.sendLog(`Ордер №${first.orderNumber} был выполнен ✅`);
        await BotService.sendLog(`По ордеру №${second.orderNumber} была совершена торговля.`);
        break;

      case 'partialBuy':
        BotService.sendMessage(second.id, `Ваш ордер №${second.orderNumber} был выполнен ✅`);
        BotService.sendMessage(first.id, `По вашему ордеру №${first.orderNumber} была выполнена закупка в размере ${second.sellAmount} ${(second.sellCoin).toUpperCase()}.\nДанные ордера №${first.orderNumber} были обновлены!`);

        await BotService.sendLog(`Ордер №${second.orderNumber} был выполнен ✅`);
        await BotService.sendLog(`По ордеру №${first.orderNumber} была совершена торговля.`);
        break;

      case 'full':
        await BotService.sendMessage(first.id, `Сделка прошла успешно! Ваш ордер №${first.orderNumber} был выполнен ✅`);
        await BotService.sendMessage(second.id, `Сделка прошла успешно! Ваш ордер №${second.orderNumber} был выполнен ✅`);

        await BotService.sendLog(`💹 Совпадение ордеров. Ордера №${first.orderNumber} и №${second.orderNumber}. Торговля выполнена успешно!`);
        break;

      default:
        break;
    }
  }
}

export default new SpotOrderMatcher;
