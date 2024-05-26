// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');
const CryptoHelper = require('../crypto');

/**
 * @description delete user session
 * @param {string} access_token - Decrypted access token
 * @returns {msg: String, err: string}
 */ const deleteUserSession = async (access_token) => {
  try {
    // * Check if access_token is valid
    if (!access_token || access_token === '')
      return [null, 'Invalid access token'];

    let [encryptedAccessToken, errEncryptingAccessToken] =
      CryptoHelper.encrypt(access_token);

    await Repository.destroy({
      tableName: DB_TABLES.RINGOVER_TOKENS,
      query: {
        encrypted_access_token: encryptedAccessToken,
      },
    });

    return ['Successfully deleted user session', null];
  } catch (err) {
    logger.error(`Unable to delete user session: `, err);
    return [null, err.message];
  }
};

module.exports = deleteUserSession;
