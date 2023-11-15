// Где то раньше подключаем artr-signer-browser.js, из него используется ArtrWallet

function logData(text) {
    const p = document.createElement('p');
    p.innerHTML = text;
    document.body.appendChild(p);
}

/**
 * Отправка в БЧ транзакции и возврат ее хэша
 * @param wallet объект с кошельком отправителя (админским)
 * @param recipient получатель (ник / artery card number / bech32 (sdk)
 * @param amount сумма в uARTR
 * @param nodeUrl url ноды
 * @return {Promise<void>}
 */
async function send(wallet, recipient, amount, nodeUrl) {
    // Резолвим адрес из ника / адреса Arteru / bech32 (sdk) адреса
    recipient = recipient.toLowerCase();
    // Не bech32 адрес
    if (recipient.indexOf('artr1') === -1) {
        //artr-xxxx.... адрес
        if (recipient.indexOf('artr-') === 0) {
            let cardNumber = recipient.replace(/\D/g, '');

            let result = await (await fetch(nodeUrl + '/artery/profile/v1beta1/get_by_card/' + cardNumber)).json();

            if (result && result.address) {
                recipient = result.address;
            } else {
                throw Error('Account with address ' + recipient + ' not found in blockchain')
            }
        } else { //Ник
            let result = await (await fetch(nodeUrl + '/artery/profile/v1beta1/get_by_nick/' + recipient)).json();

            if (result && result.address) {
                recipient = result.address;
            } else {
                throw Error('Account with nickname ' + recipient + ' not found in blockchain')
            }
        }
    }

    // let txData = ArtrWallet.wrap(wallet.send(recipient, amount, ''));
    let txData = ArtrWallet.txFactory.wrap(ArtrWallet.txFactory.send(wallet._getSigner(), wallet.address, recipient, amount));
    const response = await fetch(nodeUrl + '/cosmos/tx/v1beta1/txs', {
        method: 'POST',
        body: JSON.stringify(txData)
    })

    const txResult = await response.json();

    if (txResult.tx_response.code !== 0) {
        logData('Отправка транзакции в БЧ завершилась с ошибкой ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
        throw Error('TX broadcast failed with code ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
    }

    return txResult.tx_response.txhash;
}

/**
 * Пулит БЧ ноду в ожидании результатов транзакции
 * @param txHash хеш транзакии
 * @param nodeUrl url ноды
 * @param tries количество попыток
 * @param firstTimeout ожидание перед первым запросом
 * @param requestTimeout ожидание между повторными запросами
 * @return {Promise<Number>} 0 - транзакция выполнена, -1 - не дождались подтверждения, иначе код ошибки
 */
async function waitTxResult(txHash, nodeUrl, tries = 5, firstTimeout = 15, requestTimeout = 5) {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logData(' - ждем ' + firstTimeout + ' секунд')

    await sleep(firstTimeout * 1000);

    while (tries > 0) {
        tries--;

        let result = await (await fetch(nodeUrl + '/cosmos/tx/v1beta1/txs/' + txHash)).json();

        if (result.code === 3 && tries > 0) {
            logData(' - Осталось попыток ' + tries + ' ждем ' + requestTimeout + ' секунд')
            await sleep(requestTimeout * 1000)
        } else if (result.tx_response && result.tx_response.code !== undefined) {
            return result.tx_response.code;
        }
    }

    return -1;
}

/**
 * Отправка монет и ожидание подтверждения транзакции
 * @param recipient получатель перевода (ник, ARTR-XXXX-XXXX-XXXX адрес, или bech32 адрес)
 * @param amount uARTR для отправки
 * @return {Promise<void>}
 */
async function run(recipient = '', amount = 0) {

    logData('Создается кошелек');

    const privateKey = "6a63f702860c028c75eac8826e8acfa30df511971af44c8ae3c3fcf8c77ef56c";
    const wallet = new ArtrWallet(null, privateKey);

    // Url ноды к которой слать запросы
    const nodeUrl = 'http://167.172.51.179:1317';

    logData('Получаем данные для подписи запроса')

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

    logData('Отправляем транзакцию')
    // Отправить транзакцию
    const txHash = await send(wallet, recipient, amount, nodeUrl);
    logData('Ждем подтверждения')
    // Дождаться прохождения транзакции с указанным хешом
    const result = await waitTxResult(txHash, nodeUrl);
    let resultText = '';
    // result == 0 - Успешно выполнена
    if (result === 0) {
        resultText = 'успешно выполнена';
    }
    // result == -1 - Не дождались выполнения или транзакция не отправлена
    if (result === -1) {
        resultText = 'не дождались результата';
    }
    // result > 0 - код ошибки. 19 - такая уже обрабатывается, 32 - не верный sequence number
    if (result > 0) {
        resultText = 'выполнено с ошибкой 19';
    }
    logData('Результат ожидания: ' + result + ' (' + resultText + ')');
}

document.addEventListener('DOMContentLoaded', function () {
    run('ARTR-1122-3599-5034', 10000);
})


