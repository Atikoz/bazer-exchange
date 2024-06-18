import { walletFromMnemonic } from 'minterjs-wallet';

interface DataMinterWallet {
  address: string,
  privateKey: string,
}

const createMinterWallet = (mnemonic: string): DataMinterWallet => {
try {
  const wallet = walletFromMnemonic(mnemonic);

  const privateKeyBuffer = wallet._privKey;

  if (!privateKeyBuffer) {
    throw new Error('Private key buffer is undefined');
  }

  const privateKeyHex = privateKeyBuffer.toString('hex');

  const address = wallet.getAddressString();

  return {
    address: address,
    privateKey: privateKeyHex,
  }
  } catch (error) {
  console.error(error.message)
  return {
    address: 'null',
    privateKey: 'null',
  }
}
};

export default createMinterWallet;
