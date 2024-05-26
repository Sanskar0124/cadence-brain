// Utils
const logger = require('../../utils/winston');
const { CRYPTO_IV, CRYPTO_SECRET } = require('../../utils/config');

// Packages
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const key = CRYPTO_SECRET;
const iv = Buffer.from(CRYPTO_IV);

const encrypt = (text) => {
  try {
    if (!text) return [text, null];

    text = text.toString();
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encryptedText =
      cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

    return [encryptedText, null];
  } catch (err) {
    logger.error(`Error while encrypting text: `, err);
    return [null, err.message];
  }
};

module.exports = encrypt;
