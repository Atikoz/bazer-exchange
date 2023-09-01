const UserModel = require('../model/modelUser.js');
const WalletUserModel = require('../model/modelWallet.js');
const BalanceUserModel = require('../model/modelBalance.js');
const CreateWallet = require('../function/createWallet.js')

class AuthenticationService {
  async Authentication(userId) { 
    try {
      if (!await UserModel.findOne({id: userId})) {
        const createWallet = await CreateWallet();
        if (createWallet.status != 'ok') return this.Authentication(userId);
  
        await UserModel.create({
          id: userId,
          status: 0
        });
        await WalletUserModel.create({
          id: userId,
          del: {
            address: createWallet.del.address,
            mnemonics: createWallet.del.mnemonics,
          },
        });
        await BalanceUserModel.create({
          id: userId, 
          main: { 
            del: 0,
            pro: 0,
            dar:0,
            sbt: 0,
            reboot: 0,
            makarovsky: 0,
            btt: 0,
            dixwell: 0,
            avt: 0,
            kharat: 0,
            byacademy: 0,
            patrick: 0,
            itcoin: 0,
            messege: 0,
            rrunion: 0,
            vegvisir: 0,
            fbworld: 0,
            dcschool: 0,
            comcoin: 0,
            mintcandy: 0,
            sirius: 0,
            cgttoken: 0,
            genesis: 0,
            taxicoin: 0,
            prosmm: 0,
            sharafi: 0,
            safecoin: 0,
            dtradecoin: 0,
            izicoin: 0,
            gzacademy: 0,
            workout: 0,
            zaruba: 0,
            magnetar: 0,
            candypop: 0,
            randomx: 0,
            ekology: 0,
            emelyanov: 0,
            belymag: 0,
            doorhan: 0,
            lakshmi: 0,
            ryabinin: 0,
            related: 0,
            monopoly: 0,
            baroncoin: 0,
            nashidela: 0,
            irmacoin: 0,
            maritime: 0,
            business: 0,
            randice: 0,
            alleluia: 0,
            hosanna: 0,
            cbgrewards: 0,
            novoselka: 0,
            monkeyclub: 0,
            grandpay: 0,
            magnate: 0,
            crypton: 0,
            iloveyou: 0,
            bazercoin: 0,
            bazerusd: 0
          },
          hold: { 
            del: 0,
            pro: 0,
            dar:0,
            sbt: 0,
            reboot: 0,
            makarovsky: 0,
            btt: 0,
            dixwell: 0,
            avt: 0,
            kharat: 0,
            byacademy: 0,
            patrick: 0,
            itcoin: 0,
            messege: 0,
            rrunion: 0,
            vegvisir: 0,
            fbworld: 0,
            dcschool: 0,
            comcoin: 0,
            mintcandy: 0,
            sirius: 0,
            cgttoken: 0,
            genesis: 0,
            taxicoin: 0,
            prosmm: 0,
            sharafi: 0,
            safecoin: 0,
            dtradecoin: 0,
            izicoin: 0,
            gzacademy: 0,
            workout: 0,
            zaruba: 0,
            magnetar: 0,
            candypop: 0,
            randomx: 0,
            ekology: 0,
            emelyanov: 0,
            belymag: 0,
            doorhan: 0,
            lakshmi: 0,
            ryabinin: 0,
            related: 0,
            monopoly: 0,
            baroncoin: 0,
            nashidela: 0,
            irmacoin: 0,
            maritime: 0,
            business: 0,
            randice: 0,
            alleluia: 0,
            hosanna: 0,
            cbgrewards: 0,
            novoselka: 0,
            monkeyclub: 0,
            grandpay: 0,
            magnate: 0,
            crypton: 0,
            iloveyou: 0,
            bazercoin: 0,
            bazerusd: 0
          }
        });
        return 'ok';
       } else return;
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = new AuthenticationService();