const EncryptionService = require("../function/encryptionService");

const main = async (seed) => {
  try {
    console.log('seed', seed)
    const encrypted = EncryptionService.encryptSeed(seed);
    console.log('Encrypted:', encrypted);


    const decrypted = EncryptionService.decryptSeed(encrypted);
    console.log('Decrypted:', decrypted);
  } catch (error) {
    console.error(error);
    console.log('test error');
  }
}

(async () => {
  const seed = 'invite quality poverty height tail shoulder follow term better okay civil cheese strong skirt loyal explain present coin color frost asset correct like coach'
  await main(seed);
})();