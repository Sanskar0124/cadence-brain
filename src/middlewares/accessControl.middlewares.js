const logger = require('../utils/winston');
const Permissions = require('../rbac');
const {
  serverErrorResponseWithDevMsg,
  unauthorizedResponseWithDevMsg,
} = require('../utils/response');

const checkAccess = (action, resource) => {
  /**
   * * since its need to be used as middleware
   * * and we need action and resource to check the access for the role
   * * we make a functions to accept action and resource and return a funtion with (req,res,next) as parameters so we can use it as middleware
   */
  return async (req, res, next) => {
    try {
      // * get persmission for resource's action for user's role
      const resourceActionPermission = Permissions.can(req.user.role)[action](
        resource
      );

      // * If permission is not granted, return unAuthorized response
      if (!resourceActionPermission.granted) {
        return unauthorizedResponseWithDevMsg({
          res,
          msg: `You don't have permission to perform this action`,
        });
      }

      next();
    } catch (err) {
      logger.error(`Error while checking access: ${err.message}.`);
      return serverErrorResponseWithDevMsg({
        res,
        error: `Error while checking access: ${err.message}.`,
      });
    }
  };
};

const AccessControlMiddleware = {
  checkAccess,
};

module.exports = AccessControlMiddleware;
