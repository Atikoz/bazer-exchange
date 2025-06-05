import { Message } from "telebot";
import BotService from "../../service/telegram/BotService";
import UserManagement from "../../service/user/UserManagement";
import getTranslation, { Language } from "../../translations";
import { parseAction } from "../../utils/parseAction";
import { bot } from "../../bot";
import { RM_Home } from "../../keyboards";
import BuyBazerhubMinter from "../../models/minter/modelBuyBazerhubMinter";
import BalanceService from "../../service/balance/BalanceService";
import { UserContext } from "../../context/userContext";
import MinterService from "../../service/blockchain/minter/minterService";

const MinterServiceInstanse = new MinterService();

const WALLET_BUY_REWARD_MINTER = process.env.WALLET_BUY_REWARD_MINTER;
const MNEMONIC = process.env.MNEMONIC;

export const handlerBuyBazerhub = async (msg: Message) => {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'buyBazerhub':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          bot.sendMessage(userId, getTranslation(lang, 'operationCancelText'), { replyMarkup: RM_Home(lang) });
          return;
        }

        const amount = UserContext.get(userId, 'amount');

        const sendCashbsc = await MinterServiceInstanse.sendMinter(WALLET_BUY_REWARD_MINTER, amount, MNEMONIC, 'cashbsc');

        if (sendCashbsc.status) {
          bot.sendMessage(userId, getTranslation(lang, 'acceptBuyBazerhubText'));

          await BalanceService.updateBalance(userId, 'cashbsc', -amount);

          await BuyBazerhubMinter.create({
            id: userId,
            hash: sendCashbsc.hash
          });
        } else {
          bot.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
        }
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error handler buy Bazerhub`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}