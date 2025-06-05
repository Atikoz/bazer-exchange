import DoubleLiquidityPool from "../../models/liquidityPools/modelDoubleLiqPools";

interface OrderBook {
  bids: { price: number; amount: number }[];
  asks: { price: number; amount: number }[];
  price: number;
}

export async function getOrderBook(coinA: string, coinB: string): Promise<OrderBook | null> {
  try {
    const pool = await DoubleLiquidityPool.findOne({
      $or: [
        { firstCoin: coinA, secondCoin: coinB },
        { firstCoin: coinB, secondCoin: coinA }
      ]
    });

    if (!pool) return null;

    const isDirect = pool.firstCoin === coinA;

    let totalFirst = 0;
    let totalSecond = 0;

    for (const user of pool.poolUser) {
      totalFirst += user.amountFirstCoin;
      totalSecond += user.amountSecondCoin;
    }

    let price = totalFirst > 0 ? totalSecond / totalFirst : 0;

    if (!isDirect) {
      [totalFirst, totalSecond] = [totalSecond, totalFirst];
      price = totalFirst > 0 ? totalSecond / totalFirst : 0;
    }

    const bids = pool.poolUser
      .map(user => ({
        price,
        amount: isDirect ? user.amountSecondCoin : user.amountFirstCoin
      }))
      .sort((a, b) => b.price - a.price);

    const asks = pool.poolUser
      .map(user => ({
        price,
        amount: isDirect ? user.amountFirstCoin : user.amountSecondCoin
      }))
      .sort((a, b) => a.price - b.price);

    return { bids, asks, price };
  } catch (error) {
    console.error('[getOrderBook] Error:', error);
    return null;
  }
}
