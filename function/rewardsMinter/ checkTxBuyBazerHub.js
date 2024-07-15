const config = require("../../config");
const sendLogs = require("../../helpers/sendLog");
const sendMessage = require("../../helpers/tgFunction");
const { ControlUserBalance } = require("../../helpers/userControl");
const BuyBazerhubMinter = require("../../model/modelBuyBazerhubMinter");
const { getTransaction } = require("../minterTransaction")

const checkTxBuyBazerHub = async () => {
  try {
    const allTx = await getTransaction(config.adminMinterWallet);
    const purchasesTxArray = await BuyBazerhubMinter.find();

    for (const purchasesTx of purchasesTxArray) {
      const userTx = allTx.find((tx) => {
        const decodedPayload = Buffer.from(tx.payload, 'base64').toString('utf-8');
        return decodedPayload === purchasesTx.hash;
      }); 
      if (!userTx) return
      const purchaseAmount = +userTx.data.value;

      ControlUserBalance(purchasesTx.id, 'bazerhub', purchaseAmount);

      sendLogs(`Пользователь ${purchasesTx.id} купил ${purchaseAmount} BazerHub`);
      sendMessage(purchasesTx.id, `Вы успешно купили ${purchaseAmount} BazerHub!`);

      await BuyBazerhubMinter.deleteOne({
        hash: purchasesTx.hash
      })
    }
  } catch (error) {
    console.error('ERROR checkTxBuyBazerHub:', error.message)
  }
}

module.exports = checkTxBuyBazerHub;