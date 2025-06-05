import BalanceUser from "../../models/user/BalanceModel";


async function paginateCoinList(page: number): Promise<string[]> {
  const coinsPerPage = 20;
  const balance = await BalanceUser.findOne().lean();

  if (!balance?.main) {
    return []
  };
  
  const coins = Object.keys(balance.main).filter(
    coin => coin !== 'mine' && coin !== 'plex'
  );

  const startIndex = (page - 1) * coinsPerPage;
  const endIndex = startIndex + coinsPerPage;

  return coins.slice(startIndex, endIndex);
}

export default paginateCoinList