import { Message } from "telebot";
import UserManagement from "../../../service/user/UserManagement";
import getTranslation, { Language } from "../../../translations";
import { parseAction } from "../../../utils/parseAction";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import { investInSinglePoolButtonIK, investInSinglePoolIK, singleLiquidityPoolsIK } from "../../../keyboards";
import BotService from "../../../service/telegram/BotService";
import SingleLiquidityPool from "../../../models/liquidityPools/modelSingleLiquidityPool";
import trimNumber from "../../../utils/trimNumber";
import { bot } from "../../../bot";
import { UserContext } from "../../../context/userContext";
import { SingleLiquidityPoolService } from "../../../service/liquidityPools/SingleLiquidityPoolService";
import BalanceService from "../../../service/balance/BalanceService";
import paginateCoinList from "../../../utils/pagination/paginateCoinList";
import { generateButton } from "../../../keyboards/generators/generateButton";
import { generatePaginatedKeyboard } from "../../../keyboards/generators/generatePaginatedKeyboard";

interface UserInvestmentInfo {
  id: number;
  firstCoin: string;
  secondCoin: string;
  amountFirstCoin: number;
  amountSecondCoin: number;
}

async function handlerSinglelLiqPool(msg: Message): Promise<void> {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user, userBalance } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'singleLiquidityPools':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, `Доход начисляется в монете <b>${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}</b>. Выберите действие:`, { replyMarkup: singleLiquidityPoolsIK, parseMode: 'html' })
        break;

      case 'infoSingleLiquidityPools':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const allPoolUsers = await SingleLiquidityPool.find();

        for (const pool of allPoolUsers) {
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

      case 'mySingleLiquidityPools':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        const allUserPool = await SingleLiquidityPool.find();
        const userInvestment: UserInvestmentInfo[] = [];

        for (const pool of allUserPool) {
          const user = pool.poolUser.find(u => u.id === userId);

          if (user && (+user.amountFirstCoin > 0 || +user.amountSecondCoin > 0)) userInvestment.push({
            id: userId,
            firstCoin: pool.firstCoin,
            secondCoin: pool.secondCoin,
            amountFirstCoin: user.amountFirstCoin,
            amountSecondCoin: user.amountSecondCoin
          });
        }

        if (!userInvestment.length) {
          return BotService.sendMessage(userId, 'На данный момент вы не инвестировали в пулы ликвидности.');
        }

        for (const pool of userInvestment) {
          const dataWithdrawInvestmentsIK = bot.inlineKeyboard([
            [bot.inlineButton('Вывести из пула ❌', { callback: `dataWithdrawInvestments_${pool.firstCoin}_${pool.secondCoin}` })] //1 монета в колбеке - которую пользователь инвестировал, 2 - которою получает
          ]);

          BotService.sendMessage(userId, `Пара: ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()},
        Количество монет в пуле:
        ${trimNumber(pool.amountFirstCoin)} ${pool.firstCoin.toUpperCase()}
        ${trimNumber(pool.amountSecondCoin)} ${pool.secondCoin.toUpperCase()}`, { replyMarkup: dataWithdrawInvestmentsIK })
        }
        break;

      case 'dataWithdrawInvestments':
        const [investCoin, targetCoin] = params; // 1 монета которую инвестировал пользователь, 2 - которою получает

        UserContext.set(userId, 'investCoin', investCoin);
        UserContext.set(userId, 'targetCoin', targetCoin);

        const pool = await SingleLiquidityPool.findOne({ firstCoin: investCoin, secondCoin: targetCoin });
        const user = pool?.poolUser.find(u => u.id === userId);

        if (!user) {
          return BotService.sendMessage(userId, 'У вас нет активных инвестиций в этот пул.');
        }

        const upperInvest = investCoin.toUpperCase();
        const upperTarget = targetCoin.toUpperCase();

        const withdrawInvestmentsIK = bot.inlineKeyboard([
          [bot.inlineButton(`${upperInvest}`, { callback: `withdrawInvestments_${investCoin}` })],
          [bot.inlineButton(`${upperTarget}`, { callback: `withdrawInvestments_${targetCoin}` })],
          [bot.inlineButton('Отмена операции', { callback: `cancel` })]
        ]);

        const msg = `Выбран пул ${upperInvest}/${upperTarget}. Выберите монету для вывода.
Доступно:
${user.amountFirstCoin} ${upperInvest}
${user.amountSecondCoin} ${upperTarget}`;

        BotService.sendMessage(userId, msg, { replyMarkup: withdrawInvestmentsIK });
        break;

      case 'withdrawInvestments':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const [selectedUserCoin] = params; // монета которую пользователь хочет вывести

        UserContext.set(userId, 'selectedWithdrawCoin', selectedUserCoin);

        const investCoinLiqPoll = UserContext.get(userId, 'investCoin');
        const targetCoinLiqPoll = UserContext.get(userId, 'targetCoin');

        const selectedPools = await SingleLiquidityPool.findOne({ firstCoin: investCoinLiqPoll, secondCoin: targetCoinLiqPoll });
        const userPool = selectedPools?.poolUser.find(user => user.id === userId);

        if (!userPool) {
          return BotService.sendMessage(userId, 'Ваши инвестиции в пуле не найдены.', { parseMode: 'html' });
        }

        const isValidFirst = selectedPools.firstCoin === selectedUserCoin;
        const isValidSecond = selectedPools.secondCoin === selectedUserCoin;

        if (!isValidFirst && !isValidSecond) {
          return BotService.sendMessage(userId, 'Произошла непредвиденная ошибка, попробуйте позже.', { parseMode: 'html' });
        }

        const selectedAmount = isValidFirst ? userPool.amountFirstCoin : userPool.amountSecondCoin;
        const selectedLabel = selectedUserCoin.toUpperCase();
        const feeCoin = SpotTradeFeeCalculator.commissionCoin.toUpperCase();

        const message = `Комиссия составляет 1% от суммы вывода, оплата осуществляется в монете ${feeCoin}. Введите сумму вывода (<code>${selectedAmount}</code> ${selectedLabel}):`;

        await BotService.sendMessage(userId, message, { parseMode: 'html' });
        UserManagement.setState(userId, 50);
        break;

      case 'withdrawInvestPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          return BotService.sendMessage(userId, 'Операция отменена!')
        }

        const investCoinSingleLiqPoll = UserContext.get(userId, 'investCoin');
        const targetCoinSingleLiqPoll = UserContext.get(userId, 'targetCoin');
        const selectedCoin = UserContext.get(userId, 'selectedWithdrawCoin');
        const amountWithdraw = UserContext.get(userId, 'amountWithdrawSingleLigPool');
        const comissionWithdrawSingleLigPool = UserContext.get(userId, 'comissionWithdrawSingleLigPool');

        await SingleLiquidityPoolService.withdrawInvestments(investCoinSingleLiqPoll, targetCoinSingleLiqPoll, selectedCoin, userId, amountWithdraw);

        await BalanceService.updateBalance(userId, selectedCoin, amountWithdraw);
        await BalanceService.updateBalance(userId, SpotTradeFeeCalculator.commissionCoin, -comissionWithdrawSingleLigPool);

        await BotService.sendMessage(userId, `Вы успешно вывели ${amountWithdraw} ${selectedCoin.toUpperCase()} из пулов ликвидности. Средства успешно начислены на ваш баланс.`);
        await BotService.sendLog(`Пользователь ${userId} вывел сумму из пулов ликвидности в размере ${amountWithdraw} ${selectedCoin.toUpperCase()}.`)
        break;

      case 'investInSinglePool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        bot.sendMessage(userId, getTranslation(lang, 'chooseSectionText'), { replyMarkup: investInSinglePoolIK(lang) })
        break;

      case 'createSingleLiquidityPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const page1 = await paginateCoinList(1);
        bot.sendMessage(userId, 'Вы перешли в раздел инвестиции в пул ликвидности. В случае если выбраная пара для создания существует, будет выполнена обычная инвестиция в пул. Выберите первую монету:', { replyMarkup: generatePaginatedKeyboard(page1, 'firstCoinSinglePool', 1) })
        break;

      case 'firstCoinSinglePool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          BotService.sendMessage(
            userId,
            'Вы перешли в раздел инвестиции в пул ликвидности. В случае если выбраная пара для создания существует, будет выполнена обычная инвестиция в пул. Выберите первую монету:',
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'firstCoinSinglePool', page) }
          )
        } else {
          const selectedFirstCoin = params[0];
          const coinArray = await paginateCoinList(1);
          const index = coinArray.indexOf(selectedFirstCoin);

          UserContext.set(userId, 'firstCoinSinglePool', selectedFirstCoin);

          if (index !== -1) {
            coinArray.splice(index, 1);
          }

          BotService.sendMessage(
            userId,
            `Первая монета ${selectedFirstCoin.toUpperCase()}. Выберите вторую монету:`,
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'secondCoinSinglePool', 1) }
          )
        }
        break;

      case 'secondCoinSinglePool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const firstCoinCreatedPool = UserContext.get(userId, 'firstCoinSinglePool');

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);
          const index = coinArray.indexOf(firstCoinCreatedPool);

          if (index !== -1) {
            coinArray.splice(index, 1);
          }

          BotService.sendMessage(
            userId,
            `Первая монета ${firstCoinCreatedPool.toUpperCase()}. Выберите вторую монету:`,
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'secondCoinSinglePool', page) }
          )
        } else {
          UserContext.set(userId, 'secondCoinSinglePool', params[0]);

          const firstCoin = UserContext.get(userId, 'firstCoinSinglePool');
          const availableSum = await BalanceService.getBalance(userId, firstCoin);
          const investmentPrompt = `Введите количество монет для инвестиции в пул ликвидности. Комиссия составляет 1% от суммы инвестиции, оплата осуществляется в монете ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}. Доступно ${availableSum} ${firstCoin.toUpperCase()}: `

          BotService.sendMessage(
            userId,
            investmentPrompt
          );
          UserManagement.setState(userId, 51);
        }
        break;

      case 'createPool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const inputCoin = UserContext.get(userId, 'firstCoinSinglePool');
        const outputCoin = UserContext.get(userId, 'secondCoinSinglePool');
        const amount = UserContext.get(userId, 'amountInvestSinglePool');
        const comissionInvestment = UserContext.get(userId, 'comissionInvestmentInSinglePool');

        await SingleLiquidityPoolService.depositToPool(inputCoin, outputCoin, userId, amount)

        await BalanceService.updateBalance(userId, inputCoin, -amount);
        await BalanceService.updateBalance(userId, SpotTradeFeeCalculator.commissionCoin, -comissionInvestment);

        BotService.sendMessage(userId, `Инвестиция в пул ${inputCoin.toUpperCase()}/${outputCoin.toUpperCase()} прошла успешно ✔️`);
        BotService.sendLog(`Пользователь ${userId} инвестировал в пул ликвидности ${inputCoin.toUpperCase()}/${outputCoin.toUpperCase()} ${amount} ${inputCoin.toUpperCase()}.`);
        break;

      case 'existingSinglePool':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const availablePools = await SingleLiquidityPool.find();

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

          BotService.sendMessage(userId, `Пул: ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}
        Количество монет в пуле: 
        ${totalAmount.totalFirstCoin.toFixed(10)} ${pool.firstCoin.toUpperCase()},
        ${totalAmount.totalSecondCoin.toFixed(10)} ${pool.secondCoin.toUpperCase()}.
        Количество инвесторов: ${totalAmount.quantityInvestors}`, { replyMarkup: investInSinglePoolButtonIK(pool.firstCoin, pool.secondCoin, lang) });
        }
        break;

      case 'investInSelectSinglePool':
        UserContext.set(userId, 'firstCoinSinglePool', params[0]) // монета которую инвестировал пользователь
        UserContext.set(userId, 'secondCoinSinglePool', params[1]) // монета которую получает пользователь

        const availableSum = await BalanceService.getBalance(userId, params[1]);
        await bot.sendMessage(userId, `Введите количество монет для инвестиции в пул ликвидности. Комиссия составляет 1% от суммы инвестиции, оплата осуществляется в монете ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}. Доступно ${availableSum} ${params[0].toUpperCase()}: `);
        UserManagement.setState(userId, 51);
        break;

      default:
        break;
    }

  } catch (error) {
    console.error(`error handler single liq pool: `, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default handlerSinglelLiqPool;