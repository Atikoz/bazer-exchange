const BalanceUserModel = require("../../model/user/modelBalance");


async function paginateCoinList(page) {
  const coinsPerPage = 20;
  const balance = await BalanceUserModel.findOne();
  const coinList = Object.keys(balance.main);
  const updatedCoins = coinList.filter(coin => coin !== 'mine' && coin !== 'plex');

  const startIndex = (page - 1) * coinsPerPage;
  const endIndex = startIndex + coinsPerPage;

  // Повертаємо підмасив для поточної сторінки
  return updatedCoins.slice(startIndex, endIndex);
}

module.exports = paginateCoinList