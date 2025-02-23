const DoubleLiquidityPool = require("../model/liquidityPools/modelDoubleLiqPools");

async function getOrderBook(coinA, coinB) {
  try {
    const pool = await DoubleLiquidityPool.findOne({
      $or: [
        { firstCoin: coinA, secondCoin: coinB },
        { firstCoin: coinB, secondCoin: coinA }
      ]
    });
  
    if (!pool) {
      throw new Error(`Пул для ${coinA}/${coinB} не знайдено`);
    }
  
    let directOrder = pool.firstCoin === coinA; // Чи співпадає порядок у пулі?
    
    let totalFirstCoin = pool.poolUser.reduce((sum, user) => sum + user.amountFirstCoin, 0);
    let totalSecondCoin = pool.poolUser.reduce((sum, user) => sum + user.amountSecondCoin, 0);
  
    let price = totalFirstCoin > 0 ? totalSecondCoin / totalFirstCoin : 0;
    
    if (!directOrder) {
      // Якщо порядок у пулі не співпадає, міняємо місцями
      [totalFirstCoin, totalSecondCoin] = [totalSecondCoin, totalFirstCoin];
      price = totalFirstCoin > 0 ? totalSecondCoin / totalFirstCoin : 0;
    }
  
    const bids = pool.poolUser
      .map(user => ({
        price: price,
        amount: directOrder ? user.amountSecondCoin : user.amountFirstCoin
      }))
      .sort((a, b) => b.price - a.price); // Сортуємо за ціною від більшої до меншої
  
    const asks = pool.poolUser
      .map(user => ({
        price: price,
        amount: directOrder ? user.amountFirstCoin : user.amountSecondCoin
      }))
      .sort((a, b) => a.price - b.price); // Сортуємо від меншої до більшої
  
    return { bids, asks, price };
  } catch (error) {
    console.error(`error geting order book: ${error.message}`);
    
    return null
  }
}

module.exports = getOrderBook