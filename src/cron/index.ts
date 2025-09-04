import "dotenv/config";
import { connect } from "mongoose";
import { checkArtrAdminHash, checkArtrBalance } from "./artery/ReplenishmentArtr";
import backupDB from "./backupDB";
import checkMatchingOrders from "./checkOrders";
import { checkAdminCrossfiTransaction, checkUserCrossfiTransaction } from "./crossfi/ReplenishmentCrossfiCheck";
import accrualPurchasesBuyBazerhub from "./minter/checkTxBuyBazerhub";
import checkMinterTransaction from "./minter/ReplenishmentMinterCheck";
import rewardMinter from "./minter/MinterRewards";
import { chechAdminUsdtTransaction, checkUserUsdtTransaction } from "./usdt/ReplenishmentUsdtCheck";
import { markInactiveUsersJob } from "./users/markInactiveUsersJob";
import { startReferralUpdateJob } from "./users/ReferralJob";
import { startRewardDistributionJob } from "./crossfi/RewardCrossfiJob";

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
startRewardDistributionJob()

//ARTERY
checkArtrBalance.start();
checkArtrAdminHash.start();

//Minter
checkMinterTransaction.start();
rewardMinter.start();
accrualPurchasesBuyBazerhub.start();

//check active users
markInactiveUsersJob.start();

//update referral system
startReferralUpdateJob();

//backup database
backupDB.start();

