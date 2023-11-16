const TeleBot = require('telebot');
const config = require('./config.js');

const bot = new TeleBot (config.token);

const RM_Home = bot.keyboard([
  ['Мой кабинет 📂', 'Ордера 📒'],
  ['Конвертация 🔄', '💲 Стейкинг'],
  ['P2P','Рефералы 👥']
], { resize: true });

const spotOrderMenu = bot.inlineKeyboard([
  [bot.inlineButton('Мои ордера ✔️', { callback: 'created_SpotOrders' }), bot.inlineButton('Создать ордер ➕', { callback: 'new_SpotOrders' })],
  [bot.inlineButton('Ордера на площадке', { callback: 'list_SpotOrders' })]
]);

const settingsOrderIK = bot.inlineKeyboard([
  [bot.inlineButton('Удалить ❌', { callback: 'delete_order' }), bot.inlineButton('В главное меню', { callback: 'main_menu' })]
]);

const p2pMenuIK = bot.inlineKeyboard([
  [bot.inlineButton('Мои ордера ✔️', { callback: 'created_p2pOrders' }), bot.inlineButton('Создать ордер ➕', { callback: 'new_p2pOrders' })],
  [bot.inlineButton('Купить', { callback: 'buyList_p2pOrders' }), bot.inlineButton('Продать', { callback: 'sellList_p2pOrders' })]
]);

const createdOrderMenu = bot.inlineKeyboard([
  [bot.inlineButton('Удалить ордер', { callback: 'deleteP2P' }), bot.inlineButton('Назад 🔙', { callback: 'p2p_back' })]
]);

const typeSpotOrder = bot.inlineKeyboard([
  [bot.inlineButton('Купить', { callback: 'operation_buy' }), bot.inlineButton('Продать', { callback: 'operation_sell' })],
  [bot.inlineButton('Главное меню', { callback: 'main_menu' })],
]);

const typeP2POrder = bot.inlineKeyboard([
  [bot.inlineButton('Купить', { callback: 'p2pBuy' }), bot.inlineButton('Продать', { callback: 'p2pSell' })],
  [bot.inlineButton('Назад 🔙', { callback: 'p2p_back' })]
]);

const cabinetIK = bot.inlineKeyboard([
  [bot.inlineButton('Пополнить ➕', { callback: 'user_replenishment' }), bot.inlineButton('Вывести ➖', {callback: 'user_withdrawal' })],
  [bot.inlineButton('Балансы', { callback: 'balance' })]
]);

const balanceStartPageIK = bot.inlineKeyboard([
  [bot.inlineButton('Далее 🔜', {callback: 'balance_page2' })],
  [bot.inlineButton('Главное меню', { callback: 'main_menu' })]
]);

const balancePage2IK = bot.inlineKeyboard([
  [bot.inlineButton('Назад 🔙', { callback: 'balance' }), bot.inlineButton('Далее 🔜', {callback: 'balance_page3' })],
  [bot.inlineButton('Главное меню', { callback: 'main_menu' })]
]);

const balancePage3IK = bot.inlineKeyboard([
  [bot.inlineButton('Назад 🔙', { callback: 'balance_page2' })/*, bot.inlineButton('Далее 🔜', {callback: 'balance_page4' })*/],
  [bot.inlineButton('Главное меню', { callback: 'main_menu' })]
]);

const balancePage4IK = bot.inlineKeyboard([
  [bot.inlineButton('Назад 🔙', { callback: 'balance_page3' })],
  [bot.inlineButton('Главное меню', { callback: 'main_menu' })]
]);

const acceptCancelWithdrawalIK = bot.inlineKeyboard([
  [bot.inlineButton('Подтвердить ✅', { callback: 'accept_withdrawal' }), bot.inlineButton('Отменить ❌', { callback: 'cancel' })]
]);

const acceptCancelExchangeIK = bot.inlineKeyboard([
  [bot.inlineButton('Подтвердить ✅', { callback: 'accept_exchange' }), bot.inlineButton('Отменить ❌', { callback: 'cancel' })]
]);

const acceptCancelOrderIK = [
  'accept', 'cancel'
];
const currency = [
  'UAH', 'RUB',
  'TRY'
];

const paymentSystemUA = [
  'Monobank', 'Privatbank'
];

const paymentSystemRU = [
  'Sberbank'
];

const paymentSystemTUR = [
  'Isbank', 'GarantiBBVA'
];

const backP2PmenuIK = bot.inlineKeyboard([
  [bot.inlineButton('Назад 🔙', { callback: 'backP2Pmenu' })]
]);

const payOrder = bot.inlineKeyboard([
  [bot.inlineButton('Готово ✅', { callback: 'payOrderAccept' }), bot.inlineButton('Отменить ❌', { callback: 'payOrderCancel' })]
]);

const payOrderCoin = [
  'Перевести монеты'
];

const buyerPayOrder = [
  'Done', 'Cancel'
];

const stackingIK = bot.inlineKeyboard([
  [bot.inlineButton('Перейти к стейкингу 💲', { url: 'https://t.me/Bazer_stake_bot?start=d01pp9jcn0vphnq985fp0a7wf3zgvznshn938s868' })]
]);

module.exports = {
  RM_Home,
  payOrder,
  spotOrderMenu,
  stackingIK,
  currency,
  p2pMenuIK,
  cabinetIK,
  payOrderCoin,
  typeP2POrder,
  buyerPayOrder,
  backP2PmenuIK,
  typeSpotOrder,
  balancePage2IK,
  balancePage3IK,
  balancePage4IK,
  settingsOrderIK,
  paymentSystemUA,
  paymentSystemRU,
  paymentSystemTUR,
  createdOrderMenu,
  balanceStartPageIK,
  acceptCancelOrderIK,
  acceptCancelExchangeIK,
  acceptCancelWithdrawalIK,
  
}