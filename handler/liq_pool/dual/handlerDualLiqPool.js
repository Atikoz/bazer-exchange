const setState = require("../../../controlFunction/setState");
const ControlUserBalance = require("../../../controlFunction/userControl");
const paginateCoinList = require("../../../function/pagination/paginateCoinList");
const generateButton = require("../../../helpers/generateButton");
const generateDualLiqPoolButton = require("../../../helpers/generateIK/generateIKDualLiqPool");
const { sendMessage } = require("../../../helpers/tgFunction");
const { investInDoublePoolIK, investInDublePoolButtonIK, cancelButton } = require("../../../keyboard");
const DoubleLiquidityPool = require("../../../model/liquidityPools/modelDoubleLiqPools");
const { getInfoUser } = require("../../../service/userManagement");
const getTranslation = require("../../../translations");
const CalculateFee = require("../../../function/calculateSpotTradeFee");
const { getDualPoolData } = require("./dualPoolState");
const sendLogs = require("../../../helpers/sendLog");
const circumcisionAmount = require("../../../helpers/circumcisionAmount");
const withdrawInvestmentsDualPool = require('../../../function/liquidityPool/withdrawInvestmentsDualPool');
const getBalanceCoin = require("../../../helpers/getBalanceCoin");


const firstCoin = {};
const secondCoin = {};
const selectedInvestCoin = {};

const firstCoinSelectedPool = {};
const secondCoinSelectedPool = {};
const selectedWithdrawCoin = {};


function getSelectedInvestCoinDualLiqPool(id) {
  return {
    firstCoin: firstCoin[id] || null,
    secondCoin: secondCoin[id] || null,
    selectedInvestCoin: selectedInvestCoin[id] || null
  }
}

function getSelectedWithdrawCoinDualLiqPool(id) {
  return {
    firstCoinSelectedPool: firstCoinSelectedPool[id] || null,
    secondCoinSelectedPool: secondCoinSelectedPool[id] || null,
    selectedWithdrawCoin: selectedWithdrawCoin[id] || null
  }
}

async function handlerDualLiqPool(bot, ctx) {
  try {
    const data = ctx.data;
    const userId = ctx.from.id;
    const messageId = ctx.message.message_id;
    const { user, userBalance } = await getInfoUser(userId);
    const lang = user.lang;

    switch (true) {
      case data === 'invest_in_double_pool':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        sendMessage(userId, getTranslation(lang, 'chooseSectionText'), { replyMarkup: investInDoublePoolIK(lang) });
        break;

      case data === 'my_doubleLiquidityPools':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const allPools = await DoubleLiquidityPool.find();

        if (!allPools.length) {
          return sendMessage(userId, 'На данный момент на площадке нету сформированых пулов.')
        }

        const userInvestment = []; /* {
              id: Number,
              firstCoin: String,
              secondCoin: String,
              amountFirstCoin: Number,
              amountSecondCoin: Number,
            } */

        for (const pool of allPools) {
          const user = pool.poolUser.find(user => user.id === userId);

          if (user && (+user.amountFirstCoin > 0 || +user.amountSecondCoin > 0)) userInvestment.push({
            id: userId,
            firstCoin: pool.firstCoin,
            secondCoin: pool.secondCoin,
            amountFirstCoin: user.amountFirstCoin,
            amountSecondCoin: user.amountSecondCoin
          });
        }

        if (!userInvestment.length) {
          return bot.sendMessage(userId, 'Вы не инвестировали в пулы ликвидности.');
        }

        for (const pool of userInvestment) {
          const dataWithdrawInvestmentsIK = bot.inlineKeyboard([
            [bot.inlineButton('Вывести из пула ❌', { callback: `dataWithdrawInvestmentsDualPool_${pool.firstCoin}_${pool.secondCoin}` })] //1 монета в колбеке - которую пользователь инвестировал, 2 - которою получает
          ]);

          sendMessage(userId, `Пара: ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()},
Количество монет в пуле:
${circumcisionAmount(pool.amountFirstCoin)} ${pool.firstCoin.toUpperCase()}
${circumcisionAmount(pool.amountSecondCoin)} ${pool.secondCoin.toUpperCase()}`, { replyMarkup: dataWithdrawInvestmentsIK })
        }
        break;

      case data === 'info_doubleLiquidityPools':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const allPool = await DoubleLiquidityPool.find();

        if (!allPool.length) {
          return sendMessage(userId, `На данный момент на площадке нету сформированых пулов.`)
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

          sendMessage(userId, `Пул: ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}
Количество монет в пуле:
${totalAmount.totalFirstCoin.toFixed(10)} ${pool.firstCoin.toUpperCase()},
${totalAmount.totalSecondCoin.toFixed(10)} ${pool.secondCoin.toUpperCase()}.`)
        }
        break;

      case data === 'create_duoble_liquidity_pool':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const page1 = await paginateCoinList(1);

        sendMessage(userId, 'Вы перешли в раздел инвестиции в пул ликвидности. В случае если выбраная пара для создания существует, будет выполнена обычная инвестиция в пул. Выберите первую монету:', { replyMarkup: generateDualLiqPoolButton(bot, page1, 'firstCoinDualPool', 1) })
        break;

      case data.startsWith('firstCoinDualPool'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (data.split('_')[1] === 'Page') {
          const page = +data.split('_')[2];
          const coinArray = await paginateCoinList(page);

          sendMessage(
            userId,
            'Вы перешли в раздел инвестиции в пул ликвидности. В случае если выбраная пара для создания существует, будет выполнена обычная инвестиция в пул. Выберите первую монету:',
            { replyMarkup: generateDualLiqPoolButton(bot, coinArray, 'firstCoinDualPool', page) }
          )
        } else {
          firstCoin[userId] = data.split('_')[1];
          const coinArray = await paginateCoinList(1);
          const index = coinArray.indexOf(firstCoin[userId]);

          if (index !== -1) {
            coinArray.splice(index, 1);
          }

          sendMessage(
            userId,
            `Первая монета ${firstCoin[userId].toUpperCase()}. Выберите вторую монету:`,
            { replyMarkup: generateDualLiqPoolButton(bot, coinArray, 'secondCoinDualPool', 1) }
          )
        }
        break;

      case data.startsWith('secondCoinDualPool'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (data.split('_')[1] === 'Page') {
          const page = +data.split('_')[2];
          const coinArray = await paginateCoinList(page);
          const index = coinArray.indexOf(firstCoin[userId]);

          if (index !== -1) {
            coinArray.splice(index, 1);
          }

          sendMessage(
            userId,
            `Первая монета ${firstCoin[userId].toUpperCase()}. Выберите вторую монету:`,
            { replyMarkup: generateDualLiqPoolButton(bot, coinArray, 'secondCoinDualPool', page) }
          )
        } else {
          secondCoin[userId] = data.split('_')[1];

          sendMessage(
            userId,
            `Выбраная пара <b>${firstCoin[userId].toUpperCase()}/${secondCoin[userId].toUpperCase()}</b>\nВыберите монету в которую хотите инвестировать:`,
            { replyMarkup: generateButton([firstCoin[userId], secondCoin[userId]], 'coinToInvest'), parseMode: 'html' }
          )
        }
        break;

      case data.startsWith('coinToInvest'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        selectedInvestCoin[userId] = data.split('_')[1];
        const balanceInvestCoin = userBalance.main[selectedInvestCoin[userId]];

        sendMessage(
          userId,
          `Выбраная монета <b>${selectedInvestCoin[userId].toUpperCase()}</b>. Введите сумму инвестиции (доступно: ${balanceInvestCoin.toFixed(6)}):`,
          { replyMarkup: cancelButton, parseMode: 'html' }
        )
        setState(userId, 40);
        break;

      case data.startsWith('createDualPool'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (data.split('_')[1] === 'cancel') {
          return sendMessage(userId, 'Операция отменена.');
        } else {
          const { firstCoin, secondCoin, selectedInvestCoin, amount, comissionExchanger } = getDualPoolData(userId);
          const foundPool = await DoubleLiquidityPool.findOne({ firstCoin, secondCoin });

          if (!foundPool) {
            await DoubleLiquidityPool.create({
              firstCoin,
              secondCoin,
              poolUser: [{
                id: userId,
                amountFirstCoin: selectedInvestCoin === firstCoin ? +amount : 0,
                amountSecondCoin: selectedInvestCoin === secondCoin ? +amount : 0
              }]
            });
          } else {
            const existingUser = foundPool.poolUser.find(user => user.id === userId);

            if (existingUser) {
              // Если пользователь существует, обновляем его сумму инвестиции
              if (selectedInvestCoin === firstCoin) {
                existingUser.amountFirstCoin += +amount;
              } else if (selectedInvestCoin === secondCoin) {
                existingUser.amountSecondCoin += +amount;
              }
            } else {
              // Если пользователь не существует, добавляем его в массив poolUser
              foundPool.poolUser.push({
                id: userId,
                amountFirstCoin: selectedInvestCoin === firstCoin ? +amount : 0,
                amountSecondCoin: selectedInvestCoin === secondCoin ? +amount : 0
              });
            }

            foundPool.markModified('poolUser');
            await foundPool.save();
          }

          await ControlUserBalance(userId, selectedInvestCoin, -amount);
          await ControlUserBalance(userId, CalculateFee.commissionCoin, -comissionExchanger);

          bot.sendMessage(userId, 'Инвестиция в пул прошла успешно ✔️');
          sendLogs(`Пользователь ${userId} инвестировал в пул ликвидности ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()} ${amount} ${selectedInvestCoin.toUpperCase()}.`);
        }
        break;

      case data === 'existing_duoble_pool':
        bot.deleteMessage(userId, messageId).catch((e) => console.log('e: ', e));
        const availablePools = await DoubleLiquidityPool.find();

        if (!availablePools.length) {
          return sendMessage(userId, `На данный момент на площадке нету сформированых пулов.`)
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

      case data.startsWith('dataWithdrawInvestmentsDualPool'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        firstCoinSelectedPool[userId] = data.split('_')[1];
        secondCoinSelectedPool[userId] = data.split('_')[2];

        const selectedPool = await DoubleLiquidityPool.findOne({ firstCoin: firstCoinSelectedPool[userId], secondCoin: secondCoinSelectedPool[userId] });
        const userPool = selectedPool.poolUser.find(user => user.id === userId);

        const withdrawInvestmentsIK = bot.inlineKeyboard([
          [bot.inlineButton(`${firstCoinSelectedPool[userId].toUpperCase()}`, { callback: `withdrawDualPoolInvestments_${firstCoinSelectedPool[userId]}` })],
          [bot.inlineButton(`${secondCoinSelectedPool[userId].toUpperCase()}`, { callback: `withdrawDualPoolInvestments_${secondCoinSelectedPool[userId]}` })],
          [bot.inlineButton('Отмена операции', { callback: `cancel` })]
        ]);

        bot.sendMessage(userId, `Выбран пул ${firstCoinSelectedPool[userId].toUpperCase()}/${secondCoinSelectedPool[userId].toUpperCase()}. Выберите монету для вывода.
Доступно:
${userPool.amountFirstCoin} ${firstCoinSelectedPool[userId].toUpperCase()}
${userPool.amountSecondCoin} ${secondCoinSelectedPool[userId].toUpperCase()}`, { replyMarkup: withdrawInvestmentsIK });
        break;

      case data.startsWith('withdrawDualPoolInvestments'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        selectedWithdrawCoin[userId] = data.split('_')[1];
        const selectedPools = await DoubleLiquidityPool.findOne({ firstCoin: firstCoinSelectedPool[userId], secondCoin: secondCoinSelectedPool[userId] });
        const userShare = selectedPools.poolUser.find(user => user.id === userId);

        if (selectedPools.firstCoin !== firstCoinSelectedPool[userId] || selectedPools.secondCoin !== secondCoinSelectedPool[userId]) {
          return bot.sendMessage(userId, 'Произошла непредвиденная ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.', { parseMode: 'html' });
        }

        setState(userId, 41);

        selectedPools.firstCoin === selectedWithdrawCoin[userId]
          ? bot.sendMessage(userId, `Комиссия составляет 1% от суммы вывода, опалата осуществляется в монете ${CalculateFee.commissionCoin.toUpperCase()}. Введите сумму вывода (<code>${userShare.amountFirstCoin}</code> ${selectedPools.firstCoin.toUpperCase()}): `, { parseMode: 'html' })
          : bot.sendMessage(userId, `Комиссия составляет 1% от суммы вывода, опалата осуществляется в монете ${CalculateFee.commissionCoin.toUpperCase()}. Введите сумму вывода (<code>${userShare.amountSecondCoin}</code> ${selectedPools.secondCoin.toUpperCase()}): `, { parseMode: 'html' })
        break;

      case data.startsWith('withdrawInvestDualPool'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (data.split('_')[1] === 'cancel') {
          return sendMessage(userId, 'Операция отменена.');
        } else {
          const { firstCoin, secondCoin, selectedInvestCoin, amount, comissionExchanger } = getDualPoolData(userId);

          const withdrawResult = await withdrawInvestmentsDualPool(firstCoin, secondCoin, selectedInvestCoin, userId, amount);

          if (!withdrawResult.status) return bot.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');

          await ControlUserBalance(userId, selectedInvestCoin, amount);
          await ControlUserBalance(userId, CalculateFee.commissionCoin, -comissionExchanger);

          sendLogs(`Пользователь ${userId} вывел ${amount} ${selectedInvestCoin.toUpperCase()} из пула ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()}. Комиссия составила ${comissionExchanger} ${CalculateFee.commissionCoin.toUpperCase()}`)
          sendMessage(userId, `Вы успешно вывели ${amount} ${selectedInvestCoin.toUpperCase()} из пула ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()}`)
        }
        break;

      case data.startsWith('investInSelectDublePool'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        firstCoin[userId] = data.split('_')[1];
        secondCoin[userId] = data.split('_')[2];

        sendMessage(
          userId,
          `Выбранный пул ${firstCoin[userId].toUpperCase()}/${secondCoin[userId].toUpperCase()}. Выберите монету инвестирования:`,
          { replyMarkup: generateButton([firstCoin[userId], secondCoin[userId]], 'selectInvestCoinInDoublePool') }
        )
        break;

      case data.startsWith('selectInvestCoinInDoublePool'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        selectedInvestCoin[userId] = data.split('_')[1];

        const availableSum = await getBalanceCoin(userId, selectedInvestCoin[userId]);
        await bot.sendMessage(userId, `Введите количество монет для инвестиции в пул ликвидности. Комиссия составляет 1% от суммы инвестиции, оплата осуществляется в монете ${CalculateFee.commissionCoin.toUpperCase()}. Доступно ${availableSum} ${selectedInvestCoin[userId].toUpperCase()}: `);
        setState(userId, 42);
        break;

      case data.startsWith('investDualPool'):
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (data.split('_')[1] === 'cancel') {
          return sendMessage(userId, 'Операция отменена.');
        } else {
          const { firstCoin, secondCoin, selectedInvestCoin, amount, comissionExchanger } = getDualPoolData(userId);

          const selectPool = await DoubleLiquidityPool.findOne({ firstCoin, secondCoin });
          const isUserExist = selectPool.poolUser.find(user => user.id === userId);

          if (isUserExist) {
            // Если пользователь существует, обновляем его сумму инвестиции
            if (selectedInvestCoin === firstCoin) {
              isUserExist.amountFirstCoin += +amount;
            } else if (selectedInvestCoin === secondCoin) {
              isUserExist.amountSecondCoin += +amount;
            }
          } else {
            // Если пользователь не существует, добавляем его в массив poolUser
            selectPool.poolUser.push({
              id: userId,
              amountFirstCoin: selectedInvestCoin === firstCoin ? +amount : 0,
              amountSecondCoin: selectedInvestCoin === secondCoin ? +amount : 0
            });
          }

          selectPool.markModified('poolUser');
          await selectPool.save();

          await ControlUserBalance(userId, selectedInvestCoin, -amount);
          await ControlUserBalance(userId, CalculateFee.commissionCoin, -comissionExchanger);

          bot.sendMessage(userId, 'Инвестиция в пул прошла успешно ✔️');
          sendLogs(`Пользователь ${userId} инвестировал в пул ликвидности ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()} ${amount} ${selectedInvestCoin.toUpperCase()}.`);
        }
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error handler dual liquidity pool: ${error.message}`);
  }
}


module.exports = { handlerDualLiqPool, getSelectedInvestCoinDualLiqPool, getSelectedWithdrawCoinDualLiqPool }