import stateManagerDualLiqPool from "./liq_pool/stateManagerDualLiqPool";
import stateManagerProfitPool from "./liq_pool/stateManagerProfitPool";
import stateManagerSingleLiqPool from "./liq_pool/stateManagerSingleLiqPool";
import stateManagerP2P from "./p2p/stateManagerP2P";
import stateManagerSpotTrade from "./spotTrade/stateManagerSpotTrade";
import stateManagerBuyBazerhub from "./purchaseReceipts/stateManagerBuyBazerhub";
import stateManagerExchangeCoins from "./exchange/stateManagerExchangeCoins";
import stateManagerSettings from "./settings/stateManagerSettings";
import stateManagerUserPanel from "./userPanel/stateManagerUserPanel";

export const rangeState = [
  { range: [20, 22], handler: stateManagerUserPanel },
  { range: [23, 25], handler: stateManagerSettings },
  { range: [30, 30], handler: stateManagerBuyBazerhub },
  { range: [31, 32], handler: stateManagerExchangeCoins },
  { range: [40, 42], handler: stateManagerDualLiqPool },
  { range: [50, 51], handler: stateManagerSingleLiqPool },
  { range: [55, 55], handler: stateManagerProfitPool },
  { range: [60, 68], handler: stateManagerP2P },
  { range: [70, 72], handler: stateManagerSpotTrade },
];
