const crypto = require('crypto');
const config = require('../config');


class EncryptionService {
  #algorithm
  #ivLength
  #secretKey

  constructor() {
    this.#algorithm = 'aes-256-cbc';
    this.#ivLength = 16;
    this.#secretKey = Buffer.from(config.encryptionKey, 'hex');

    if (this.#secretKey.length !== 32) {
      throw new Error('Secret key повинен бути довжиною 32 байти (256 біт).');
    }
  }

  generate() {
    const secretKey = crypto.randomBytes(32);
    console.log('Секретний ключ (hex):', secretKey.toString('hex'))
    console.log('Секретний ключ:', secretKey)
  }

  encryptSeed(seedPhrase, key = this.#secretKey) {
    const iv = crypto.randomBytes(this.#ivLength);
    const cipher = crypto.createCipheriv(this.#algorithm, Buffer.from(key), iv);
  
    let encrypted = cipher.update(seedPhrase, 'utf8', 'hex');
    encrypted += cipher.final('hex');
  
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decryptSeed(encryptedSeed, key = this.#secretKey) {
    const [ivHex, encryptedData] = encryptedSeed.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.#algorithm, Buffer.from(key), iv);
  
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
  
    return decrypted;
  }
}

module.exports = new EncryptionService;