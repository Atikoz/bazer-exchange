const TeleBot = require('telebot');
const config = require('./config.js');
const getTranslation = require('./translations/index.js');


const bot = new TeleBot(config.token);

const RM_Home = (lang = "eng") => bot.keyboard([
  [getTranslation(lang, "myAccount"), getTranslation(lang, "tradeButton")],
  [getTranslation(lang, "converting"), getTranslation(lang, "staking")],
  [getTranslation(lang, 'purchasingBazerHub'), getTranslation(lang, "referrals")],
  [getTranslation(lang, "settings"), getTranslation(lang, "instructions")],
  [getTranslation(lang, "buyDelForRub"), getTranslation(lang, "buyCashbsc")]
], { resize: true });

const RM_Trade = (lang = "eng") => bot.keyboard([
  [getTranslation(lang, "spotTrading"), 'P2P'],
  [getTranslation(lang, "pools")],
  [getTranslation(lang, "mainMenuButton")]
], { resize: true });

const spotOrderMenu = (lang = "eng") => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, "currentOrders"), { callback: 'created_SpotOrders' }), bot.inlineButton(getTranslation(lang, "createOrder"), { callback: 'new_SpotOrders' })],
  [bot.inlineButton(getTranslation(lang, "listOrders"), { callback: 'list_SpotOrders' }), bot.inlineButton(getTranslation(lang, "completeOrders"), { callback: 'completed_SpotOrders' })],
]);

const settingsIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'changeLang'), { callback: 'change_lang' }), bot.inlineButton(getTranslation(lang, 'support'), { callback: 'support' })],
  [bot.inlineButton(getTranslation(lang, 'changeEmail'), { callback: 'change_Email' })],
]);

const languageIK = bot.inlineKeyboard([
  [bot.inlineButton('English 🇬🇧', { callback: 'selectLang_eng' })],
  [bot.inlineButton('Русский 🇷🇺', { callback: 'selectLang_ru' })]
]);

const typeP2P = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'p2pTradeButton'), { callback: 'trade_p2p' }), bot.inlineButton(getTranslation(lang, 'p2pDealButton'), { callback: 'deal_p2p' })]
]);

const tradeP2PMenuIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'myOrders'), { callback: 'created_p2pOrders' }), bot.inlineButton(getTranslation(lang, 'createOrder'), { callback: 'new_p2pOrders' })],
  [bot.inlineButton(getTranslation(lang, 'buy'), { callback: 'buyList_p2pOrders' }), bot.inlineButton(getTranslation(lang, 'sell'), { callback: 'sellList_p2pOrders' })]
]);

const typeP2POrder = bot.inlineKeyboard([
  [bot.inlineButton('Купить', { callback: 'p2pBuy' }), bot.inlineButton('Продать', { callback: 'p2pSell' })],
  [bot.inlineButton('Назад 🔙', { callback: 'p2p_back' })]
]);

const cabinetIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'deposit'), { callback: 'user_replenishment' }), bot.inlineButton(getTranslation(lang, 'withdraw'), { callback: 'user_withdrawal' })],
  [bot.inlineButton(getTranslation(lang, 'balance'), { callback: 'balance' })]
]);

const balanceStartPageIK = bot.inlineKeyboard([
  [bot.inlineButton('Далее 🔜', { callback: 'balance_page2' })],
  [bot.inlineButton('Главное меню', { callback: 'main_menu' })]
]);

const balancePage2IK = bot.inlineKeyboard([
  [bot.inlineButton('Назад 🔙', { callback: 'balance' }), bot.inlineButton('Далее 🔜', { callback: 'balance_page3' })],
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

const acceptCancelWithdrawalIK = (lang = "eng") => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'confirmText'), { callback: 'accept_withdrawal' }), bot.inlineButton(getTranslation(lang, 'cancelText'), { callback: 'cancel' })]
]);

const acceptCancelExchangeIK = (lang = "eng") => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'confirmText'), { callback: 'accept_exchange' }), bot.inlineButton(getTranslation(lang, 'cancelText'), { callback: 'cancel' })]
]);

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

const payOrder = bot.inlineKeyboard([
  [bot.inlineButton('Готово ✅', { callback: 'payOrderAccept' }), bot.inlineButton('Отменить ❌', { callback: 'payOrderCancel' })]
]);

const payOrderCoin = [
  'Перевести монеты'
];

const buyerPayOrder = [
  'Done', 'Cancel'
];

const bazerStackingIK = bot.inlineKeyboard([
  [bot.inlineButton('BAZER STAKING WALLET', { url: 'https://t.me/Bazer_stake_bot?start=d01pp9jcn0vphnq985fp0a7wf3zgvznshn938s868' })]
]);

const buyDelForRubIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'buyDelForRubButton'), { url: 'https://t.me/+RseklArJALAwMDQy' })],
  [bot.inlineButton(getTranslation(lang, 'buyDelForRubInstrtuctionButton'), { url: 'https://decimalchain.com/blog/ru/kak-kupit-del-za-rubli/' })]
]);

const buyCashbscIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'buyCashbsc'), { url: 'https://t.me/+RseklArJALAwMDQy' })],
  [bot.inlineButton(getTranslation(lang, 'instructions'), { url: 'https://google.com' })]
]);

const singleLiquidityPoolsIK = bot.inlineKeyboard([
  [bot.inlineButton('Инвестировать в пул', { callback: 'invest_in_single_pool' }), bot.inlineButton('Мои инвестиции', { callback: 'my_single_liquidityPools' })],
  [bot.inlineButton('Информация о пулах', { callback: 'info_single_liquidityPools' })]
]);

const doubleLiquidityPoolsIK = bot.inlineKeyboard([
  [bot.inlineButton('Инвестировать в пул', { callback: 'invest_in_double_pool' }), bot.inlineButton('Мои инвестиции', { callback: 'my_doubleLiquidityPools' })],
  [bot.inlineButton('Информация о пулах', { callback: 'info_doubleLiquidityPools' })]
]);

const investInSinglePoolIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'createPool'), { callback: 'create_single_liquidity-pool' }), bot.inlineButton(getTranslation(lang, 'existingPools'), { callback: 'existing-single-pool' })]
]);

const investInDoublePoolIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'createPool'), { callback: 'create_duoble_liquidity_pool' }), bot.inlineButton(getTranslation(lang, 'existingPools'), { callback: 'existing_duoble_pool' })]
]);

const investInPoolButtonIK = (firstCoin, secondCoin, lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'investInPoolButton'), { callback: `investInSelectPool_${firstCoin}_${secondCoin}` })]
]);

const investInDublePoolButtonIK = (firstCoin, secondCoin, lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'investInPoolButton'), { callback: `investInSelectDublePool_${firstCoin}_${secondCoin}` })]
]);
const exchangeIK = bot.inlineKeyboard([
  [bot.inlineButton('Decimal', { callback: 'decimalExchange' }), bot.inlineButton('Minter', { callback: 'minterExchange' })],
  [bot.inlineButton('Bazer', { callback: 'bazerExchange' })]
]);

const filterSpotOrdersIK = bot.inlineKeyboard([
  [bot.inlineButton('Все ордера', { callback: 'allList_SpotOrders' }), bot.inlineButton('Фильтр', { callback: 'filterList_SpotOrders' })]
]);

const filterCompleteSpotOrdersIK = bot.inlineKeyboard([
  [bot.inlineButton('Все ордера', { callback: 'allCompleteList_SpotOrders' }), bot.inlineButton('Фильтр', { callback: 'filterCompleteList_SpotOrders' })]
]);

const filterSellP2PIK = bot.inlineKeyboard([
  [bot.inlineButton('Все ордера', { callback: 'allList_sellP2P' }), bot.inlineButton('Фильтр', { callback: 'filterList_sellP2P' })]
]);

const filterBuyP2PIK = bot.inlineKeyboard([
  [bot.inlineButton('Все ордера', { callback: 'allList_buyP2P' }), bot.inlineButton('Фильтр', { callback: 'filterList_buyP2P' })]
]);

const adminPanelIK = bot.inlineKeyboard([
  [bot.inlineButton('Удалить найденую транзакцию', { callback: 'deleteUserHash' })]
]);

const instructionsMenuIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'pools'), { callback: 'instructions_liquidityPools' }), bot.inlineButton('P2P', { callback: 'instructions_p2p' })],
  [bot.inlineButton(getTranslation(lang, 'spotTrading'), { callback: 'instructions_spotTrade' })]
]);

const instructionsLiuidityPoolMenuIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'instructionsInvestInLiqPool'), { callback: 'instructions_investIn_LiqPool' })]
]);

const poolMenuIK = (lang = 'eng') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, "singleLiquidityPoolsIK"), { callback: 'single_liquidity_pools' }), bot.inlineButton(getTranslation(lang, "dualLiquidityPoolsIK"), { callback: 'dual_liquidity_pool' })],
  [bot.inlineButton('Снять прибыль с пулов', { callback: 'profit_liquidityPools' })]
]);

const cancelButton = bot.inlineKeyboard([
  [bot.inlineButton('Отмена', { callback: 'cancel' })],
]);


module.exports = {
  RM_Home,
  typeP2P,
  RM_Trade,
  payOrder,
  bazerStackingIK,
  cancelButton,
  currency,
  settingsIK,
  languageIK,
  tradeP2PMenuIK,
  cabinetIK,
  poolMenuIK,
  exchangeIK,
  payOrderCoin,
  typeP2POrder,
  buyCashbscIK,
  buyerPayOrder,
  spotOrderMenu,
  investInSinglePoolIK,
  investInDoublePoolIK,
  balancePage2IK,
  balancePage3IK,
  buyDelForRubIK,
  balancePage4IK,
  filterBuyP2PIK,
  filterSellP2PIK,
  paymentSystemUA,
  paymentSystemRU,
  paymentSystemTUR,
  singleLiquidityPoolsIK,
  doubleLiquidityPoolsIK,
  balanceStartPageIK,
  filterSpotOrdersIK,
  instructionsMenuIK,
  investInPoolButtonIK,
  acceptCancelExchangeIK,
  acceptCancelWithdrawalIK,
  investInDublePoolButtonIK,
  filterCompleteSpotOrdersIK,
  instructionsLiuidityPoolMenuIK

}