const crypto = require('crypto');

function encrypt(text, key = "12345678901234567890123456789015") { // 32 байта для aes-256-cbc
  const iv = crypto.randomBytes(16); // 16 байт для aes-256-cbc
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText, key = "12345678901234567890123456789015") {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedTextPart = textParts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'utf-8'), iv);
  let decrypted = decipher.update(encryptedTextPart, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}

module.exports = {
 encrypt,
 decrypt
}