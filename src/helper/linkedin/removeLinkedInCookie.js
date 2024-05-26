// * Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// * Repository
const Repository = require('../../repository');

// * Logout user from LinkedIn - encrypted_linkedin_cookie : null
const removeLinkedInCookie = async ({ user_id }) => {
  try {
    let [_, errUpdatingUserToken] = await Repository.update({
      tableName: DB_TABLES.USER_TOKEN,
      query: {
        user_id,
      },
      updateObject: {
        encrypted_linkedin_cookie: null,
      },
    });
    if (errUpdatingUserToken) return [null, errUpdatingUserToken];

    return [true, null];
  } catch (err) {
    logger.error(
      `An error occurred while attempting to remove LinkedIn Cookie: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = removeLinkedInCookie;
