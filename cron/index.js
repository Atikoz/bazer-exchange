const mongoose = require('mongoose');
const checkOrders = require('../cron/OrderCheck.js');
const checkUserTransaction = require('../cron/ReplenishmentStatusCheck.js');
const checkMinterTransaction = require('../cron/ReplenishmentMinterCheck.js');
const checkUserExchangeTransaction = require('../cron/StatusCheckExchanger.js');
const { checkArtrBalance, checkArtrAdminHash } = require('../cron/ReplenishmentArtr.js');
const { checkUserUsdtTransaction, chechAdminUsdtTransaction } = require('../cron/ReplenishmentUsdtCheck.js');
const { checkUserMpxXfiTransaction, checkAdminMpxXfiTransaction } = require('../cron/ReplenishmentMpxXfiCheck.js');
const { checkUserMinePlexTransaction, chechAdminMinePlexTransaction, checkHashSendAdminComission } = require('../cron/ReplenishmentMineCheck.js');

mongoose.connect('mongodb://127.0.0.1/test');


//SpotTrade
checkOrders.start();

//Decimal
checkUserTransaction.start();
checkUserExchangeTransaction.start();

//USDT
checkUserUsdtTransaction.start();
chechAdminUsdtTransaction.start();

//MINE PLEX
checkUserMinePlexTransaction.start();
chechAdminMinePlexTransaction.start();
checkHashSendAdminComission.start();

//MPX XFI
checkUserMpxXfiTransaction.start();
checkAdminMpxXfiTransaction.start();

//ARTERY
checkArtrBalance.start();
checkArtrAdminHash.start();

//BIP
checkMinterTransaction.start()