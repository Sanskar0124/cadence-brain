// Utils
const logger = require('../utils/winston');

// Models
const { User_Token, User } = require('../db/models');

// Helpers and Services
const JsonHelper = require('../helper/json');

const createUserToken = async (userToken) => {
  try {
    const createdUserToken = await User_Token.create(userToken);

    return [createdUserToken, null];
  } catch (err) {
    logger.error(`Error while creating user token: ${err.message}.`);
    return [null, err.message];
  }
};

const getUserTokenByQuery = async (query) => {
  try {
    // * find a user token for given query
    const userToken = await User_Token.findOne({
      where: query,
      include: User,
    });

    return [JsonHelper.parse(userToken), null];
  } catch (err) {
    logger.error(`Error while fetching user token by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getUserTokensByQuery = async (query) => {
  try {
    // * find a user tokens for given query
    const userTokens = await User_Token.findAll({
      where: query,
      include: User,
    });

    return [JsonHelper.parse(userTokens), null];
  } catch (err) {
    logger.error(`Error while fetching user tokens by query: ${err.message}.`);
    return [null, err.message];
  }
};

const updateUserTokenByQuery = async (query, userToken) => {
  try {
    const data = await User_Token.update(userToken, {
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while updating user token by query: ${err.message}.`);
    return [null, err.message];
  }
};

const deleteUserTokenByQuery = async (query) => {
  try {
    const data = await User_Token.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting user token by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getUserTokensByQueryAndUserQuery = async (
  ut_query,
  user_query,
  ut_attributes = [],
  user_attributes = []
) => {
  try {
    // * find a user tokens for given query
    const userTokens = await User_Token.findAll({
      where: ut_query,
      attributes: ut_attributes,
      include: [
        {
          model: User,
          where: user_query,
          attributes: user_attributes,
        },
      ],
    });

    return [JsonHelper.parse(userTokens), null];
  } catch (err) {
    logger.error(`Error while fetching user tokens by query: ${err.message}.`);
    return [null, err.message];
  }
};

const UserTokenRepository = {
  createUserToken,
  getUserTokenByQuery,
  getUserTokensByQuery,
  updateUserTokenByQuery,
  deleteUserTokenByQuery,
  getUserTokensByQueryAndUserQuery,
};

module.exports = UserTokenRepository;
