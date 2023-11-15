/**
 * Т.к. в функции резмещения аккаунта не было необходимости ранее, ее структура сообщения для протобуф отсутствует в
 * .proto файлах и также она отсутствует в коде.
 *
 * в patches лежит патч для patch-package который добавляет в библиотеку необходимый код
 */

import {Wallet} from 'dem-api';
import fetch from "node-fetch";
import bip39 from 'bip39';
import crypto from "crypto";

/**
 * Отправка в БЧ транзакции и возврат ее хэша
 * @param wallet объект с кошельком отправителя (админским)
 * @param address адрес регистрируемого аккаунта
 * @param nickname ник создаваемого аккаунта
 * @param nodeUrl url ноды
 * @return {Promise<void>}
 */
async function createAccount(wallet, address, nickname, nodeUrl) {
    let txData = Wallet.wrap(wallet.createAccount(address, wallet.address, nickname));
    const response = await fetch(nodeUrl + '/cosmos/tx/v1beta1/txs', {
        method: 'POST',
        body: JSON.stringify(txData)
    })

    const txResult = await response.json();

    if (txResult.tx_response.code !== 0) {
        console.log('Отправка транзакции в БЧ завершилась с ошибкой ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
        throw Error('TX broadcast failed with code ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
    }

    console.log('Результат отправки транзакции', txResult);

    return txResult.tx_response.txhash;
}

(async function run() {
//const privateKey = "6a63f702860c028c75eac8826e8acfa30df511971af44c8ae3c3fcf8c77ef56c";
    const seed = 'remind silver mystery maple raven paddle brief loud comic above correct have merit wheel blue melody upon kitten garage front depth ordinary floor ensure';
    const wallet = new Wallet(seed);

// Url ноды к которой слать запросы
    const nodeUrl = 'http://167.172.51.179:1317';

    console.log('Получаем данные для подписи запроса')

// Получаем текущие данные аккаунта
// Примичание - данные обновляются раз в блок. Если отправляется несколько транзакций подряд - за sequence number
// необходимо следить самостоятельно!
    const accData = await (await fetch(nodeUrl + '/cosmos/auth/v1beta1/accounts/' + wallet.address)).json();

// Текущая версия сети Artery Blockchain
    wallet.setChainId('artery_network-9')

// Номер аккаунта в БЧ (получается запросом выше)
    wallet.setAccNo(accData.account.account_number + '');

// Sequence Number - порядковый номер транзакции с момента создания аккаунта (получается запросом выше)
    wallet.setSequence(accData.account.sequence + '')

    for (let i = 0; i < 10; i++) {
        // Создаем новый сид для пользователя (или делаем ключ другим удобным способом)
        const mnemonic = bip39.generateMnemonic(256, crypto.randomBytes);
        console.log(mnemonic)
        // Получаем кошелек из сида
        const newAcc = new Wallet(mnemonic);
        // Для простоты никнейм делаем из адреса простым хешированием
        let nickname = crypto.createHash('md5').update(newAcc.address).digest("hex");

        await createAccount(wallet, newAcc.address, nickname, nodeUrl);
        wallet.setSequence(Number(wallet.sequence) + 1);
    }
})();