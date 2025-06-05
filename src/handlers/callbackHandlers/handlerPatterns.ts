import { handlerBuyBazerhub } from "./purchaseReceipts/handleBuyBazerhub";
import handlerExchangeCoins from "./exchange/handlerExchangeCoins";
import { handlerUserPanel } from "./userPanel/handlerUserPanel";
import handleSettings from "./settings/handleSettings";
import handlerDualLiqPool from "./liq_pool/handlerDualLiqPool";
import handlerProfitPool from "./liq_pool/handlerProfitPool";
import handlerSinglelLiqPool from "./liq_pool/handlerSingleLiqPool";
import handleP2P from "./p2p/handleP2P";
import handleSpotTrade from "./spotTrade/handleSpotTrade";

export const handlerPatterns = [
  {
    handler: handlerDualLiqPool,
    patterns: [
      /^dualLiquidityPool/,
      /^investInSelectDublePool$/,
      /^selectInvestCoinInDoublePool$/,
      /^investInDoublePool$/,
      /^myDoubleLiquidityPools$/,
      /^infoDoubleLiquidityPools$/,
      /^createDuobleLiquidityPool$/,
      /^existingDuoblePool$/,
      /^firstCoinDualPool$/,
      /^secondCoinDualPool$/,
      /^coinToInvest$/,
      /^createDualPool$/,
      /^dataWithdrawInvestmentsDualPool$/,
      /^withdrawDualPoolInvestments$/,
      /^withdrawInvestDualPool$/,
      /^investDualPool$/
    ],
  },

  {
    handler: handlerSinglelLiqPool,
    patterns: [
      /^singleLiquidityPools$/,
      /^infoSingleLiquidityPools$/,
      /^mySingleLiquidityPools$/,
      /^dataWithdrawInvestments$/,
      /^withdrawInvestments$/,
      /^withdrawInvestPool$/,
      /^createSingleLiquidityPool$/,
      /^investInSinglePool$/,
      /^existingSinglePool$/,
      /^firstCoinSinglePool$/,
      /^secondCoinSinglePool$/,
      /^createPool$/,
      /^investInSelectSinglePool$/
    ],
  },

  {
    handler: handlerProfitPool,
    patterns: [
      /^profitLiquidityPools$/,
      /^withdrawPoolProfit$/,
    ]
  },

  {
    handler: handlerUserPanel,
    patterns: [
      /^balance$/,
      /^replenishment$/,
      /^withdrawal$/,
      /^acceptWithdrawal$/,
      /^cancel$/,
      /^instructionsLiquidityPools$/,
      /^instructionsP2P$/,
      /^instructionsInvestInLiqPool$/,
      /^instructionsSpotTrade$/,
    ],
  },

  {
    handler: handlerBuyBazerhub,
    patterns: [
      /^buyBazerhub$/,
    ],
  },

  {
    handler: handlerExchangeCoins,
    patterns: [
      /^decimalExchange$/,
      /^minterExchange$/,
      /^selectSellCoinMinterExchange$/,
      /^selectBuyCoinMinterExchange$/,
      /^confirmMinterExchange$/,
      /^bazerExchange$/,
      /^selectCoinBazerSwap$/,
      /^confirmBazerSwap$/,
    ],
  },

  {
    handler: handleSettings,
    patterns: [
      /^changeLang$/,
      /^selectLang$/,
      /^changeEmail$/,
      /^support$/,
    ],
  },

  {
    handler: handleP2P,
    patterns: [
      /^tradeP2P$/,
      /^dealP2P$/,
      /^p2pBack$/,
      /^createdP2POrders$/,
      /^newP2POrder$/,
      /^p2pBuy$/,
      /^p2pSelectBuyCoin$/,
      /^selectCurrencyP2P$/,
      /^selectPaymentSystemP2P$/,
      /^createOrderP2P$/,
      /^p2pSell$/,
      /^p2pTrade$/,
      /^p2pSelectSellCoin$/,
      /^deleteOrderP2P$/,
      /^showBuyP2POrders$/,
      /^p2pSellOrderConfirm$/,
      /^p2pBuyOrderConfirm$/,
      /^sellerSendCoin$/,
      /^payOrder$/,
      /^p2pSellerConfirm$/,
      /^showSellP2POrders$/,
      /^filterOrdersP2P$/,
      /^coinFilterP2P$/,
      /^currencyFilterP2P$/,
      /^showAllOrdersP2P$/,
    ],
  },

  {
    handler: handleSpotTrade,
    patterns: [
      /^completedSpotOrders$/,
      /^allCompletedSpotOrders$/,
      /^filtredCompletedSpotOrders$/,
      /^spotOrdersCompletedFilterSellCoin$/,
      /^spotOrdersCompletedFilterBuyCoin$/,
      /^listSpotOrders$/,
      /^allSpotOrders$/,
      /^createCounterOrder$/,
      /^createSpotOrder$/,
      /^filtredSpotOrders$/,
      /^spotOrdersFilterSellCoin$/,
      /^spotOrdersFilterBuyCoin$/,
      /^createdSpotOrders$/,
      /^deleteOrderSpotTrade$/,
      /^createNewSpotOrders$/,
      /^spotTradeNewOrderSelectSellCoin$/,
      /^spotTradeNewOrderSelectBuyCoin$/,
      
      
    ],
  },
];