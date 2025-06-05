import { Message } from "telebot";
import UserManagement from "../../../service/user/UserManagement";
import { parseAction } from "../../../utils/parseAction";
import { bot } from "../../../bot";
import BotService from "../../../service/telegram/BotService";
import getTranslation, { Language } from "../../../translations";
import { cancelButton, doubleLiquidityPoolsIK, investInDoublePoolIK, investInDublePoolButtonIK } from "../../../keyboards";
import DoubleLiquidityPool from "../../../models/liquidityPools/modelDoubleLiqPools";
import trimNumber from "../../../utils/trimNumber";
import paginateCoinList from "../../../utils/pagination/paginateCoinList";
import { generatePaginatedKeyboard } from "../../../keyboards/generators/generatePaginatedKeyboard";
import { UserContext } from "../../../context/userContext";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import { DoubleLiquidityPoolService } from "../../../service/liquidityPools/DoubleLiquidityPoolService";
import BalanceService from "../../../service/balance/BalanceService";
import { generateButton } from "../../../keyboards/generators/generateButton";

interface UserInvestment {
  id: number;
  firstCoin: string;
  secondCoin: string;
  amountFirstCoin: number;
  amountSecondCoin: number;
}

async function handlerDualLiqPool(msg: Message): Promise<void> {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user, userBalance } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'dualLiquidityPool':
        BotService.deleteMessage(userId, messageId);
        BotService.sendMessage(userId, `Доход начисляется в монете <b>${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}</b>. Выберите действие:`, { replyMarkup: doubleLiquidityPoolsIK, parseMode: 'html' })
        break;

      case 'investInDoublePool':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, getTranslation(lang, 'chooseSectionText'), { replyMarkup: investInDoublePoolIK(lang) });
        break;

      case 'myDoubleLiquidityPools':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const allPools = await DoubleLiquidityPool.find();

        if (!allPools.length) {
          return BotService.sendMessage(userId, 'На данный момент на площадке нету сформированых пулов.')
        }

        const userInvestment: UserInvestment[] = [];

        for (const pool of allPools) {
          const user = pool.poolUser.find(user => user.id === userId);

          if (user && (+user.amountFirstCoin > 0 || +user.amountSecondCoin > 0)) {
            userInvestment.push({
              id: userId,
              firstCoin: pool.firstCoin,
              secondCoin: pool.secondCoin,
              amountFirstCoin: user.amountFirstCoin,
              amountSecondCoin: user.amountSecondCoin
            });
          }
        }

        if (!userInvestment.length) {
          return bot.sendMessage(userId, 'Вы не инвестировали в пулы ликвидности.');
        }

        for (const pool of userInvestment) {
          const dataWithdrawInvestmentsIK = bot.inlineKeyboard([
            [bot.inlineButton('Вывести из пула ❌', { callback: `dataWithdrawInvestmentsDualPool_${pool.firstCoin}_${pool.secondCoin}` })] //1 монета в колбеке - которую пользователь инвестировал, 2 - которою получает
          ]);

          BotService.sendMessage(userId, `Пара: ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()},
        Количество монет в пуле:
        ${trimNumber(pool.amountFirstCoin)} ${pool.firstCoin.toUpperCase()}
        ${trimNumber(pool.amountSecondCoin)} ${pool.secondCoin.toUpperCase()}`, { replyMarkup: dataWithdrawInvestmentsIK })
        }
        break

      case 'dataWithdrawInvestmentsDualPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        UserContext.set(userId, 'firstCoinSelectedPool', params[0]);
        UserContext.set(userId, 'secondCoinSelectedPool', params[1]);

        const selectedPool = await DoubleLiquidityPool.findOne({ firstCoin: UserContext.get(userId, 'firstCoinSelectedPool'), secondCoin: UserContext.get(userId, 'secondCoinSelectedPool') });
        const userPool = selectedPool.poolUser.find(user => user.id === userId);

        const withdrawInvestmentsIK = bot.inlineKeyboard([
          [bot.inlineButton(`${UserContext.get(userId, 'firstCoinSelectedPool').toUpperCase()}`, { callback: `withdrawDualPoolInvestments_${UserContext.get(userId, 'firstCoinSelectedPool')}` })],
          [bot.inlineButton(`${UserContext.get(userId, 'secondCoinSelectedPool').toUpperCase()}`, { callback: `withdrawDualPoolInvestments_${UserContext.get(userId, 'secondCoinSelectedPool')}` })],
          [bot.inlineButton('Отмена операции', { callback: `cancel` })]
        ]);

        BotService.sendMessage(userId, `Выбран пул ${UserContext.get(userId, 'firstCoinSelectedPool').toUpperCase()}/${UserContext.get(userId, 'secondCoinSelectedPool').toUpperCase()}. Выберите монету для вывода.
Доступно:
${userPool.amountFirstCoin} ${UserContext.get(userId, 'firstCoinSelectedPool').toUpperCase()}
${userPool.amountSecondCoin} ${UserContext.get(userId, 'secondCoinSelectedPool').toUpperCase()}`, { replyMarkup: withdrawInvestmentsIK });
        break;

      case 'withdrawDualPoolInvestments':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        UserContext.set(userId, 'selectedWithdrawCoinDuobleLiqPool', params[0]);

        const selectedPools = await DoubleLiquidityPool.findOne({ firstCoin: UserContext.get(userId, 'firstCoinSelectedPool'), secondCoin: UserContext.get(userId, 'secondCoinSelectedPool') });
        const userShare = selectedPools.poolUser.find(user => user.id === userId);

        if (selectedPools.firstCoin !== UserContext.get(userId, 'firstCoinSelectedPool') || selectedPools.secondCoin !== UserContext.get(userId, 'secondCoinSelectedPool')) {
          return BotService.sendMessage(userId, 'Произошла непредвиденная ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.', { parseMode: 'html' });
        }

        UserManagement.setState(userId, 41);

        selectedPools.firstCoin === UserContext.get(userId, 'selectedWithdrawCoinDuobleLiqPool')
          ? bot.sendMessage(userId, `Комиссия составляет 1% от суммы вывода, опалата осуществляется в монете ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}. Введите сумму вывода (<code>${userShare.amountFirstCoin}</code> ${selectedPools.firstCoin.toUpperCase()}): `, { parseMode: 'html' })
          : bot.sendMessage(userId, `Комиссия составляет 1% от суммы вывода, опалата осуществляется в монете ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}. Введите сумму вывода (<code>${userShare.amountSecondCoin}</code> ${selectedPools.secondCoin.toUpperCase()}): `, { parseMode: 'html' })
        break;

      case 'withdrawInvestDualPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          return BotService.sendMessage(userId, 'Операция отменена.');
        }

        const firstCoin = UserContext.get(userId, 'firstCoinSelectedPool');
        const secondCoin = UserContext.get(userId, 'secondCoinSelectedPool');
        const selectedWithdrawCoin = UserContext.get(userId, 'selectedWithdrawCoinDuobleLiqPool');
        const amount = UserContext.get(userId, 'amount');
        const comissionWithdraw = UserContext.get(userId, 'commissionWithdrawCoin');

        await DoubleLiquidityPoolService.withdrawInvestments(firstCoin, secondCoin, selectedWithdrawCoin, userId, amount);

        await BalanceService.updateBalance(userId, selectedWithdrawCoin, amount);
        await BalanceService.updateBalance(userId, SpotTradeFeeCalculator.commissionCoin, -comissionWithdraw);

        BotService.sendLog(`Пользователь ${userId} вывел ${amount} ${selectedWithdrawCoin.toUpperCase()} из пула ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()}. Комиссия составила ${comissionWithdraw} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}`)
        BotService.sendMessage(userId, `Вы успешно вывели ${amount} ${selectedWithdrawCoin.toUpperCase()} из пула ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()}`)
        break;

      case 'infoDoubleLiquidityPools':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const allPool = await DoubleLiquidityPool.find();

        if (!allPool.length) {
          return BotService.sendMessage(userId, `На данный момент на площадке нету сформированых пулов.`)
        }

        for (const pool of allPool) {
          const usersArray = pool.poolUser;

          const totalAmount = usersArray.reduce((acc, user) => {
            acc.totalFirstCoin += user.amountFirstCoin
            acc.totalSecondCoin += user.amountSecondCoin

            return acc
          }, { totalFirstCoin: 0, totalSecondCoin: 0 });

          if (totalAmount.totalFirstCoin <= 0 && totalAmount.totalSecondCoin <= 0) {
            return
          }

          BotService.sendMessage(userId, `Пул: ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}
        Количество монет в пуле:
        ${totalAmount.totalFirstCoin.toFixed(10)} ${pool.firstCoin.toUpperCase()},
        ${totalAmount.totalSecondCoin.toFixed(10)} ${pool.secondCoin.toUpperCase()}.`)
        }
        break;

      case 'createDuobleLiquidityPool':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const page1 = await paginateCoinList(1);

        BotService.sendMessage(userId, 'Вы перешли в раздел инвестиции в пул ликвидности. В случае если выбраная пара для создания существует, будет выполнена обычная инвестиция в пул. Выберите первую монету:', { replyMarkup: generatePaginatedKeyboard(page1, 'firstCoinDualPool', 1) })
        break;

      case 'firstCoinDualPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          BotService.sendMessage(
            userId,
            'Вы перешли в раздел инвестиции в пул ликвидности. В случае если выбраная пара для создания существует, будет выполнена обычная инвестиция в пул. Выберите первую монету:',
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'firstCoinDualPool', page) }
          )
        } else {
          const selectedFirstCoin = params[0];
          UserContext.set(userId, 'firstCoinDualPool', selectedFirstCoin);
          const coinArray = await paginateCoinList(1);
          const index = coinArray.indexOf(selectedFirstCoin);

          if (index !== -1) {
            coinArray.splice(index, 1);
          }

          BotService.sendMessage(
            userId,
            `Первая монета ${selectedFirstCoin.toUpperCase()}. Выберите вторую монету:`,
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'secondCoinDualPool', 1) }
          )
        }
        break;

      case 'secondCoinDualPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const firstCoinCreatedPool = UserContext.get(userId, 'firstCoinDualPool');

        if (params[0] === 'Page') {
          const page = +data.split('_')[2];
          const coinArray = await paginateCoinList(page);
          const index = coinArray.indexOf(firstCoinCreatedPool);

          if (index !== -1) {
            coinArray.splice(index, 1);
          }

          BotService.sendMessage(
            userId,
            `Первая монета ${firstCoinCreatedPool.toUpperCase()}. Выберите вторую монету:`,
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'secondCoinDualPool', page) }
          )
        } else {
          UserContext.set(userId, 'secondCoinDualPool', params[0]);

          BotService.sendMessage(
            userId,
            `Выбраная пара <b>${firstCoinCreatedPool.toUpperCase()}/${params[0].toUpperCase()}</b>\nВыберите монету в которую хотите инвестировать:`,
            { replyMarkup: generateButton([firstCoinCreatedPool, params[0]], 'coinToInvest'), parseMode: 'html' }
          )
        }
        break;

      case 'coinToInvest':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        UserContext.set(userId, 'selectedInvestCoinDualLiqPool', params[0]);
        const balanceInvestCoin = userBalance.main[params[0] as keyof typeof userBalance.main];

        BotService.sendMessage(
          userId,
          `Выбраная монета <b>${params[0].toUpperCase()}</b>. Введите сумму инвестиции (доступно: ${balanceInvestCoin.toFixed(6)}):`,
          { replyMarkup: cancelButton, parseMode: 'html' }
        );
        UserManagement.setState(userId, 40);
        break;

      case 'createDualPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          return BotService.sendMessage(userId, 'Операция отменена.');
        }

        const firstCoinDualPool = UserContext.get(userId, 'firstCoinDualPool') as string;
        const secondCoinDualPool = UserContext.get(userId, 'secondCoinDualPool') as string;
        const selectedInvestCoinDulaPool = UserContext.get(userId, 'selectedInvestCoinDualLiqPool') as string;
        const amountInvestmentInDulaPool = UserContext.get(userId, 'amount') as number;
        const comissionInvestmentInDualPool = UserContext.get(userId, 'comissionInvestmentInDualPool') as number;

        await DoubleLiquidityPoolService.depositToPool(
          firstCoinDualPool,
          secondCoinDualPool,
          selectedInvestCoinDulaPool,
          userId,
          amountInvestmentInDulaPool
        );

        await BalanceService.updateBalance(userId, selectedInvestCoinDulaPool, -amountInvestmentInDulaPool);
        await BalanceService.updateBalance(userId, SpotTradeFeeCalculator.commissionCoin, -comissionInvestmentInDualPool);

        BotService.sendMessage(userId, `Инвестиция в пул ${firstCoinDualPool.toUpperCase()}/${secondCoinDualPool.toUpperCase()} прошла успешно ✔️`);
        BotService.sendLog(`Пользователь ${userId} инвестировал в пул ликвидности ${firstCoinDualPool.toUpperCase()}/${secondCoinDualPool.toUpperCase()} ${amountInvestmentInDulaPool} ${selectedInvestCoinDulaPool.toUpperCase()}.`);
        break;

      case 'existingDuoblePool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        const availablePools = await DoubleLiquidityPool.find();

        if (!availablePools.length) {
          return BotService.sendMessage(userId, `На данный момент на площадке нету сформированых пулов.`)
        }

        for (const pool of availablePools) {
          const usersArray = pool.poolUser;

          const totalAmount = usersArray.reduce((acc, user) => {
            acc.totalFirstCoin += user.amountFirstCoin
            acc.totalSecondCoin += user.amountSecondCoin
            acc.quantityInvestors++

            return acc
          }, { totalFirstCoin: 0, totalSecondCoin: 0, quantityInvestors: 0 });


          if (totalAmount.totalFirstCoin <= 0 && totalAmount.totalSecondCoin <= 0) {
            return
          }

          bot.sendMessage(userId, `Пул: ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}
        Количество монет в пуле:
        ${totalAmount.totalFirstCoin.toFixed(10)} ${pool.firstCoin.toUpperCase()},
        ${totalAmount.totalSecondCoin.toFixed(10)} ${pool.secondCoin.toUpperCase()}.
        Количество инвесторов: ${totalAmount.quantityInvestors}`, { replyMarkup: investInDublePoolButtonIK(pool.firstCoin, pool.secondCoin, lang) })
        }
        break;

      case 'investInSelectDublePool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        UserContext.set(userId, 'firstCoinDualPool', params[0]);
        UserContext.set(userId, 'secondCoinDualPool', params[1]);

        BotService.sendMessage(
          userId,
          `Выбранный пул ${params[0].toUpperCase()}/${params[1].toUpperCase()}. Выберите монету инвестирования:`,
          { replyMarkup: generateButton([params[0], params[1]], 'selectInvestCoinInDoublePool') }
        )
        break;

      case 'selectInvestCoinInDoublePool':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        UserContext.set(userId, 'selectedInvestCoinDualLiqPool', params[0]);

        const availableSum = await BalanceService.getBalance(userId, params[0]);
        await BotService.sendMessage(userId, `Введите количество монет для инвестиции в пул ликвидности. Комиссия составляет 1% от суммы инвестиции, оплата осуществляется в монете ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}. Доступно ${availableSum} ${params[0].toUpperCase()}`);
        UserManagement.setState(userId, 42);
        break;

      case 'investDualPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          return BotService.sendMessage(userId, 'Операция отменена.');
        }

        const firstCoinInDualPool = UserContext.get(userId, 'firstCoinDualPool') as string;
        const secondCoinInDualPool = UserContext.get(userId, 'secondCoinDualPool') as string;
        const selectedInvestCoinDualPool = UserContext.get(userId, 'selectedInvestCoinDualLiqPool') as string;
        const comissionInvestmentDualPool = UserContext.get(userId, 'comissionInvestmentInDualPool') as string;
        const amountInDualPool = UserContext.get(userId, 'amount') as number;

        await DoubleLiquidityPoolService.depositToPool(
          firstCoinInDualPool,
          secondCoinInDualPool,
          selectedInvestCoinDualPool,
          userId,
          amountInDualPool
        );

        await BalanceService.updateBalance(userId, selectedInvestCoinDualPool, -amountInDualPool);
        await BalanceService.updateBalance(userId, SpotTradeFeeCalculator.commissionCoin, -comissionInvestmentDualPool);

        BotService.sendMessage(userId, 'Инвестиция в пул прошла успешно ✔️');
        BotService.sendLog(`Пользователь ${userId} инвестировал в пул ликвидности ${firstCoinInDualPool.toUpperCase()}/${secondCoinInDualPool.toUpperCase()} ${amountInDualPool} ${selectedInvestCoinDualPool.toUpperCase()}.`);
        break;
    }
  } catch (error) {
    console.error(`error handler dual liq pool: `, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default handlerDualLiqPool;