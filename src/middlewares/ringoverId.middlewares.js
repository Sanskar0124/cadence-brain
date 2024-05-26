// Utils
const {
  badRequestResponseWithDevMsg,
  forbiddenResponseWithDevMsg,
  serverErrorResponseWithDevMsg,
} = require('../utils/response');

// Repositories
const UserRepository = require('../repository/user-repository');

module.exports = async (req, res, next) => {
  try {
    const [user, err] = await UserRepository.findUserByQuery({
      user_id: req.user.user_id,
    });
    if (err)
      return badRequestResponseWithDevMsg({
        res,
        msg: 'User does not exist',
        error: `Error while finding user by query: ${err.message}`,
      });

    if (!user.ringover_user_id)
      return forbiddenResponseWithDevMsg({
        res,
        error: 'Ringover user id is not present',
      });

    req.user = { ...user, ...req.user };
    next();
  } catch (err) {
    logger.error('Error while checking ringover id middleware:', err);
    return serverErrorResponseWithDevMsg({
      res,
      error: `Error while checking ringover id middleware: ${err.message}`,
    });
  }
};
