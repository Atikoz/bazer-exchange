import "dotenv/config";
import { connect } from "mongoose";
import { checkArtrAdminHash, checkArtrBalance } from "./artery/ReplenishmentArtr";
import backupDB from "./backupDB";
import checkMatchingOrders from "./checkOrders";
import { checkAdminCrossfiTransaction, checkUserCrossfiTransaction } from "./crossfi/ReplenishmentCrossfiCheck";
import accrualPurchasesBuyBazerhub from "./minter/checkTxBuyBazerhub";
import checkMinterTransaction from "./minter/ReplenishmentMinterCheck";
import rewardMinter from "./minter/RewardBazerHUB";
import { chechAdminUsdtTransaction, checkUserUsdtTransaction } from "./usdt/ReplenishmentUsdtCheck";

const MONGO_URI = process.env.MONGO_URI as string;

connect(MONGO_URI);


//SpotTrade
checkMatchingOrders.start();

// //Decimal
// checkUserTransaction.start();
// checkUserExchangeTransaction.start();

// USDT
checkUserUsdtTransaction.start();
chechAdminUsdtTransaction.start();

//CROSSFI
checkUserCrossfiTransaction.start();
checkAdminCrossfiTransaction.start();

// //ARTERY
// checkArtrBalance.start();
// checkArtrAdminHash.start();

//Minter
checkMinterTransaction.start();
rewardMinter.start();
accrualPurchasesBuyBazerhub.start();

//backup database
backupDB.start();
