// Utils
const logger = require('../../utils/winston');
const { CRYPTO_IV, CRYPTO_SECRET } = require('../../utils/config');

// Packages
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const key = CRYPTO_SECRET;
const iv = Buffer.from(CRYPTO_IV);

const decrypt = (text) => {
  try {
    if (!text) return [text, null];

    text = text.toString();
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decryptedText =
      decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');

    return [decryptedText, null];
  } catch (err) {
    logger.error(`Error while decrypting text: `, err);
    return [null, err.message];
  }
};

module.exports = decrypt;
