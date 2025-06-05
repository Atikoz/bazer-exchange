import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;


if (ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY має бути 64 hex-символи (32 байти = 256 біт)');
}

class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;
  private readonly secretKey: Buffer;

  constructor() {
    this.secretKey = Buffer.from(ENCRYPTION_KEY, 'hex');
  }

  generate(): void {
    const secretKey = crypto.randomBytes(32);
    console.log('🔐 Секретний ключ (hex):', secretKey.toString('hex'));
    console.log('🔐 Секретний ключ:', secretKey);
  }

  encryptSeed(seedPhrase: string, key: Buffer = this.secretKey): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(seedPhrase, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  decryptSeed(encryptedSeed: string, key: Buffer = this.secretKey): string {
    const [ivHex, encryptedData] = encryptedSeed.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

export default new EncryptionService;