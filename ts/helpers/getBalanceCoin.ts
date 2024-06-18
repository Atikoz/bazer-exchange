import getInfoUser from "../service/getInfoUser";

async function getBalanceCoin(userId: number, coin: string): Promise<number> {
  const infoUser = await getInfoUser(userId);
  const balanceCoin = infoUser.userBalance.main[coin];
  console.log('balanceCoin: ', balanceCoin);

  return balanceCoin;
};

export default getBalanceCoin;