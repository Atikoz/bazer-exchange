import getTranslation, { Language } from "../../translations";

export function getP2POrderPreviewText(
  type: 'buy' | 'sell',
  lang: Language,
  data: {
    orderNumber: number;
    coin: string;
    amount: number;
    minimalAmountSell: number;
    currency: string;
    paymentSystem: string;
    rate: number;
    requisites?: string;
  }
): string {
  const coinUpper = data.coin.toUpperCase();
  const lines: string[] = [];

  lines.push(`${getTranslation(lang, 'orderNumber')} ${data.orderNumber}`);
  lines.push(`${getTranslation(lang, 'orderType')} ${type}`);
  
  if (type === 'buy') {
    lines.push(`${getTranslation(lang, 'buyingCoin')} ${coinUpper}`);
    lines.push(`${getTranslation(lang, 'purchaseQuantity')} ${data.amount} ${coinUpper}`);
    lines.push(`Минимальная сумма покупки монеты ${data.minimalAmountSell} ${coinUpper}`);
  } else {
    lines.push(`Продажа монеты: ${coinUpper}`);
    lines.push(`Количество продажи: ${data.amount} ${coinUpper}`);
    lines.push(`Минимальная сумма продажи монеты: ${data.minimalAmountSell} ${coinUpper}`);
  }

  lines.push(`Валюта совершения сделки: ${data.currency}`);
  lines.push(`Способ облаты: ${data.paymentSystem}`);
  lines.push(`Курс ${type === 'buy' ? 'покупки' : 'продажи'}: ${data.rate} ${data.currency}`);
  
  if (type === 'sell' && data.requisites) {
    lines.push(`Реквизиты: ${data.requisites}`);
  }

  return lines.join(',\n');
}
