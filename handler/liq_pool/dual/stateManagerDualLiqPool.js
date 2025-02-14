const setState = require("../../../controlFunction/setState");
const CalculateFee = require("../../../function/calculateSpotTradeFee");
const generateButton = require("../../../helpers/generateButton");
const poolDataValidation = require("../../../validator/pool/poolDataValidation");
const withdrawInvestmentsDualPoolValidator = require("../../../validator/pool/withdrawInvestmentsDualPool");
const { setDualPoolData } = require("./dualPoolState");
const { getSelectedInvestCoinDualLiqPool, getSelectedWithdrawCoinDualLiqPool } = require("./handlerDualLiqPool");


const amount = [];
const comissionExchanger = [];
const choice = ['accept', 'cancel'];

async function stateManagerDualLiqPool(bot, ctx, state) {
  try {
    const text = ctx.text;
    const userId = ctx.from.id;

    switch (state) {
      case 40:
        setState(userId, 0)
        amount[userId] = text;

        const data = getSelectedInvestCoinDualLiqPool(userId);

        if (!selectedInvestCoin) {
          throw new Error('selected Invest Coin is null')
        }

        comissionExchanger[userId] = await CalculateFee.calculateSpotTradeFee(amount[userId], data.selectedInvestCoin);
        const isValidPoolData = await poolDataValidation(userId, amount[userId], data.selectedInvestCoin, comissionExchanger[userId]);

        if (!isValidPoolData.status) {
          return bot.sendMessage(userId, isValidPoolData.errorMessage);
        }

        setDualPoolData(userId, data.firstCoin, data.secondCoin, data.selectedInvestCoin, amount[userId], comissionExchanger[userId]);

        const createPoolMesg = `Торговля осуществляется по рыночной цене. Проскальзывание составляет 5%.
Пара: ${data.firstCoin.toUpperCase()}/${data.secondCoin.toUpperCase()},
Количество монет для пула: ${amount[userId]} ${data.selectedInvestCoin.toUpperCase()}.
Комиссия: ${comissionExchanger[userId]} ${CalculateFee.commissionCoin.toUpperCase()}.`;
        bot.sendMessage(userId, createPoolMesg, { replyMarkup: generateButton(choice, 'createDualPool') });
        break;

      case 41:
        setState(userId, 0);
        amount[userId] = +text;

        const { firstCoinSelectedPool, secondCoinSelectedPool, selectedWithdrawCoin } = getSelectedWithdrawCoinDualLiqPool(userId);

        comissionExchanger[userId] = await CalculateFee.calculateSpotTradeFee(amount[userId], selectedWithdrawCoin);

        const validationWithdrawPoolInv = await withdrawInvestmentsDualPoolValidator(firstCoinSelectedPool, secondCoinSelectedPool, selectedWithdrawCoin, amount[userId], userId, comissionExchanger[userId]);

        if (!validationWithdrawPoolInv.status) {
          return bot.sendMessage(userId, validationWithdrawPoolInv.message);
        }

        setDualPoolData(userId, firstCoinSelectedPool, secondCoinSelectedPool, selectedWithdrawCoin, amount[userId], comissionExchanger[userId]);

        bot.sendMessage(userId, `Вы хотите вывести средства из пула ликвидности в объеме ${amount[userId]} ${selectedWithdrawCoin.toUpperCase()}. Комиссия составляет ${comissionExchanger[userId]} ${CalculateFee.commissionCoin.toUpperCase()}.`, { replyMarkup: generateButton(choice, 'withdrawInvestDualPool') })
        break;

      case 42:
        setState(userId, 0)
        amount[userId] = text;

        const { firstCoin, secondCoin, selectedInvestCoin } = getSelectedInvestCoinDualLiqPool(userId);

        if (!selectedInvestCoin) {
          throw new Error('selected Invest Coin is null')
        }

        comissionExchanger[userId] = await CalculateFee.calculateSpotTradeFee(amount[userId], selectedInvestCoin);
        const isValidDoublePoolData = await poolDataValidation(userId, amount[userId], selectedInvestCoin, comissionExchanger[userId]);

        if (!isValidDoublePoolData.status) {
          return bot.sendMessage(userId, isValidDoublePoolData.errorMessage);
        }

        setDualPoolData(userId, firstCoin, secondCoin, selectedInvestCoin, amount[userId], comissionExchanger[userId]);

        const investPoolMesg = `Торговля осуществляется по рыночной цене. Проскальзывание составляет 5%.
Пара: ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()},
Количество монет для пула: ${amount[userId]} ${selectedInvestCoin.toUpperCase()}.
Комиссия: ${comissionExchanger[userId]} ${CalculateFee.commissionCoin.toUpperCase()}.`;

        bot.sendMessage(userId, investPoolMesg, { replyMarkup: generateButton(choice, 'investDualPool') });
        break;
    }
  } catch (error) {
    console.error(`error state manager dual liq pool: ${error.message}`)
  }
}

module.exports = stateManagerDualLiqPool;