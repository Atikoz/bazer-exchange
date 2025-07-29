import { UserWallet } from "../interface/UserWallet";
import { coinToWalletMap, defaultWalletKey } from "./mappings/coinToWalletMap";
import { disabledCoins } from "./mappings/disabledCoins";

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}


export function getWalletByCoin(coin: string, wallet: UserWallet): string | null {
  const isMapped = coinToWalletMap.hasOwnProperty(coin);
  const walletKey = isMapped ? coinToWalletMap[coin] : defaultWalletKey;

  // Якщо монета явно відключена
  if (disabledCoins.has(coin)) {
    return 'disabled';
  }

  // Якщо монета не в мапі (тобто fallback до defaultWalletKey), і хочемо відключити "всі інші"
  if (!isMapped && disabledCoins.has('__default__')) {
    return 'disabled';
  }

  const value = getNestedValue(wallet, walletKey as string);


  return typeof value === 'object' && value?.address ? value.address : value || null;
}
