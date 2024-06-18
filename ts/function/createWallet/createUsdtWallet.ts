import { generateAccount } from 'tron-create-address';

interface DataUsdtWallet {
  address: string,
  privateKey: string
}
async function CreateUsdtWallet (): Promise<DataUsdtWallet> {
  const { address, privateKey } = generateAccount();

  return {
    address: address,
    privateKey: privateKey
  }
};

export default CreateUsdtWallet;