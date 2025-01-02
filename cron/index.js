const mongoose = require('mongoose');
const checkOrders = require('../cron/OrderCheck.js');
const checkUserTransaction = require('../cron/decimal/ReplenishmentStatusCheck.js');
const checkMinterTransaction = require('../cron/minter/ReplenishmentMinterCheck.js');
const checkUserExchangeTransaction = require('../cron/decimal/StatusCheckExchanger.js');
const { checkArtrBalance, checkArtrAdminHash } = require('../cron/artery/ReplenishmentArtr.js');
const { checkUserUsdtTransaction, chechAdminUsdtTransaction } = require('../cron/usdt/ReplenishmentUsdtCheck.js');
const backupDB = require('../cron/backupDB.js');
const rewardMinter = require('./minter/RewardBazerHUB.js');
const accrualPurchasesBuyBazerhub = require('./minter/checkTxBuyBazerhub.js');
const createFreeAcc = require('./createFeeAccount.js');
const config = require('../config.js');
const { checkUserCrossfiTransaction, checkAdminCrossfiTransaction } = require('./crossfi/ReplenishmentMpxXfiCheck.js');

mongoose.connect(config.dataBaseUrl);


//SpotTrade
checkOrders.start();

// //Decimal
// checkUserTransaction.start();
// checkUserExchangeTransaction.start();

//USDT
checkUserUsdtTransaction.start();
chechAdminUsdtTransaction.start();

//CROSSFI
checkUserCrossfiTransaction.start();
checkAdminCrossfiTransaction.start();

//ARTERY
checkArtrBalance.start();
checkArtrAdminHash.start();

//Minter
checkMinterTransaction.start();
rewardMinter.start();
accrualPurchasesBuyBazerhub.start();

//backup database
backupDB.start();

// // create free account
// createFreeAcc.start();