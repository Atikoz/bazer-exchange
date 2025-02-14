const { handlerDualLiqPool } = require('../liq_pool/dual/handlerDualLiqPool.js')

const handlerPatterns = [
  // двухсторонние пулы ликвидности
  { pattern: /^investInSelectDublePool_[a-zA-Z]+_[a-zA-Z]+$/, handler: handlerDualLiqPool },
  { pattern: /^selectInvestCoinInDoublePool_[a-zA-Z]+$/, handler: handlerDualLiqPool },
  { pattern: /^invest_in_double_pool$/, handler: handlerDualLiqPool },
  { pattern: /^my_doubleLiquidityPools$/, handler: handlerDualLiqPool },
  { pattern: /^info_doubleLiquidityPools$/, handler: handlerDualLiqPool },
  { pattern: /^create_duoble_liquidity_pool$/, handler: handlerDualLiqPool },
  { pattern: /^existing_duoble_pool$/, handler: handlerDualLiqPool },
  { pattern: /^firstCoinDualPool_[a-zA-Z0-9_]+$/, handler: handlerDualLiqPool },
  { pattern: /^secondCoinDualPool_[a-zA-Z0-9_]+$/, handler: handlerDualLiqPool },
  { pattern: /^coinToInvest_[a-zA-Z0-9]+$/, handler: handlerDualLiqPool },
  { pattern: /^createDualPool_[a-zA-Z]+$/, handler: handlerDualLiqPool },
  { pattern: /^dataWithdrawInvestmentsDualPool_[a-zA-Z]+_[a-zA-Z]+$/, handler: handlerDualLiqPool },
  { pattern: /^withdrawDualPoolInvestments_[a-zA-Z]+$/, handler: handlerDualLiqPool },
  { pattern: /^withdrawInvestDualPool_[a-zA-Z]+$/, handler: handlerDualLiqPool },
  { pattern: /^investDualPool_[a-zA-Z]+$/, handler: handlerDualLiqPool },
];

module.exports = handlerPatterns