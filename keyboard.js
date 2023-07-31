const TeleBot = require('telebot');
const config = require('./config.js');

const bot = new TeleBot (config.token);

const RM_Home = bot.keyboard([
  ['Мой кабинет 📂', 'Ордера 📒'],
  ['Конвертация 🔄'],
  ['Настройка торговли ⚙️','Рефералы 👥']
], { resize: true });

const orderMenu = bot.inlineKeyboard([
  [bot.inlineButton('Мои ордера ✔️', { callback: 'created_orders' }), bot.inlineButton('Создать ордер ➕', { callback: 'new_order' })],
  [bot.inlineButton('Ордера на площадке', { callback: 'list_order' })]
]);

const settingsOrderIK = bot.inlineKeyboard([
  [bot.inlineButton('Удалить ❌', { callback: 'delete_order' }), bot.inlineButton('В главное меню', { callback: 'main_menu' })]
]);

const typeOrder = bot.inlineKeyboard([
  [bot.inlineButton('Купить', { callback: 'operation_buy' }), bot.inlineButton('Продать', { callback: 'operation_sell' })],
  [bot.inlineButton('Главное меню', { callback: 'main_menu' })],
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
]

const sellExchangeIK = [
  'del', 'pro',
  'dar',
];

module.exports = {
  RM_Home,
  typeOrder,
  orderMenu,
  cabinetIK,
  sellExchangeIK,
  balancePage2IK,
  balancePage3IK,
  balancePage4IK,
  settingsOrderIK,
  balanceStartPageIK,
  acceptCancelOrderIK,
  acceptCancelExchangeIK,
  acceptCancelWithdrawalIK,
  
}