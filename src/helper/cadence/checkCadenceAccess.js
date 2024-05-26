const logger = require('../../utils/winston');
const {
  USER_ROLE,
  CADENCE_ACTIONS,
  CADENCE_TYPES,
} = require('../../utils/enums');

const checkCadenceActionAccess = ({ cadence, user, action, data }) => {
  try {
    switch (action) {
      case CADENCE_ACTIONS.CREATE: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            if (
              cadence.type === CADENCE_TYPES.PERSONAL &&
              cadence.user_id === user.user_id
            )
              return [true, null];
            else return [false, null];
          }
          //case USER_ROLE.SALES_MANAGER: {
          //if (
          //[CADENCE_TYPES.PERSONAL, CADENCE_TYPES.TEAM].includes(
          //cadence.type
          //) &&
          //cadence.user_id === user.user_id
          //)
          //return [true, null];
          //else return [false, null];
          //}
          case USER_ROLE.SALES_MANAGER:
          case USER_ROLE.SUPER_ADMIN:
          case USER_ROLE.ADMIN: {
            if (cadence.user_id === user.user_id) return [true, null];
            else return [false, null];
          }
          default:
            return [false, null];
        }
      }

      case CADENCE_ACTIONS.READ: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            if (
              (cadence.type === CADENCE_TYPES.PERSONAL &&
                cadence.user_id === user.user_id) ||
              (cadence.type === CADENCE_TYPES.TEAM &&
                cadence.sd_id === user.sd_id) ||
              (cadence.type === CADENCE_TYPES.COMPANY &&
                cadence.company_id === user.company_id)
            )
              return [true, null];
            else return [false, null];
          }
          //case USER_ROLE.SALES_MANAGER: {
          //if (
          //cadence.User?.sd_id === user.sd_id ||
          //cadence.sd_id === user.sd_id ||
          //(cadence.type === CADENCE_TYPES.COMPANY &&
          //cadence.company_id === user.company_id)
          //)
          //return [true, null];
          //else return [false, null];
          //}
          case USER_ROLE.SALES_MANAGER:
          case USER_ROLE.SUPER_ADMIN:
          case USER_ROLE.ADMIN: {
            if (
              cadence.User?.company_id === user.company_id ||
              cadence?.Sub_Department?.Department?.company_id ===
                user.company_id ||
              cadence.company_id === user.company_id
            )
              return [true, null];
            else return [false, null];
          }
          default: {
            return [false, null];
          }
        }
      }

      case CADENCE_ACTIONS.UPDATE:
      case CADENCE_ACTIONS.DELETE: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            if (
              cadence.type === CADENCE_TYPES.PERSONAL &&
              cadence.user_id === user.user_id
            )
              return [true, null];
            else return [false, null];
          }
          //case USER_ROLE.SALES_MANAGER: {
          //if (
          //(cadence.type === CADENCE_TYPES.PERSONAL &&
          //cadence.user_id === user.user_id) ||
          //(cadence.type === CADENCE_TYPES.TEAM &&
          //cadence.sd_id === user.sd_id)
          //)
          //return [true, null];
          //else return [false, null];
          //}
          case USER_ROLE.SALES_MANAGER:
          case USER_ROLE.SUPER_ADMIN:
          case USER_ROLE.ADMIN: {
            if (
              (cadence.type === CADENCE_TYPES.PERSONAL &&
                cadence.user_id === user.user_id) ||
              (cadence.type !== CADENCE_TYPES.PERSONAL &&
                cadence.User?.company_id === user.company_id) ||
              (cadence.type !== CADENCE_TYPES.PERSONAL &&
                cadence.company_id === user.company_id) ||
              (cadence.type !== CADENCE_TYPES.PERSONAL &&
                cadence?.Sub_Department?.Department?.company_id ===
                  user.company_id)
            )
              return [true, null];
            else return [false, null];
          }
          default: {
            return [false, null];
          }
        }
      }

      case CADENCE_ACTIONS.DUPLICATE: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            if (
              cadence.type === CADENCE_TYPES.PERSONAL &&
              cadence.user_id === user.user_id &&
              data?.ogCadence?.type === CADENCE_TYPES.PERSONAL
            )
              return [true, null];
            else return [false, null];
          }
          //case USER_ROLE.SALES_MANAGER: {
          //if (
          //(cadence.type === CADENCE_TYPES.PERSONAL &&
          //cadence.user_id === user.user_id &&
          //data?.ogCadence?.type === CADENCE_TYPES.PERSONAL) ||
          //(cadence.type === CADENCE_TYPES.TEAM &&
          //cadence.sd_id === user.sd_id)
          //)
          //return [true, null];
          //else return [false, null];
          //}
          case USER_ROLE.SALES_MANAGER:
          case USER_ROLE.SUPER_ADMIN:
          case USER_ROLE.ADMIN: {
            if (
              (cadence.type === CADENCE_TYPES.PERSONAL &&
                cadence.user_id === user.user_id &&
                data?.ogCadence?.type === CADENCE_TYPES.PERSONAL) ||
              (cadence.type === CADENCE_TYPES.TEAM &&
                data?.ogCadence?.Sub_Department?.Department?.company_id ===
                  user.company_id &&
                data?.ogCadence?.type === CADENCE_TYPES.TEAM) ||
              (cadence.type === CADENCE_TYPES.COMPANY &&
                cadence.company_id === user.company_id &&
                data?.ogCadence?.type === CADENCE_TYPES.COMPANY)
            )
              return [true, null];
            else return [false, null];
          }
          default: {
            return [false, null];
          }
        }
      }

      case CADENCE_ACTIONS.SHARE: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON:
          case USER_ROLE.SALES_MANAGER:
          case USER_ROLE.SUPER_ADMIN:
          case USER_ROLE.ADMIN: {
            if (
              (cadence.type === CADENCE_TYPES.PERSONAL &&
                (data?.toShareUser?.company_id === user.company_id ||
                  data?.toShareSubDepartment?.Department?.company_id ===
                    user.company_id)) ||
              (cadence.type === CADENCE_TYPES.TEAM &&
                (data?.ogCadence?.Sub_Department?.Department?.company_id ===
                  user.company_id ||
                  data?.ogCadence?.User?.company_id === user.company_id) &&
                (data?.toShareUser?.company_id === user.company_id ||
                  data?.toShareSubDepartment?.Department?.company_id ===
                    user.company_id)) ||
              (cadence.type === CADENCE_TYPES.COMPANY &&
                cadence.company_id === user.company_id &&
                data?.ogCadence?.type !== CADENCE_TYPES.COMPANY)
            )
              return [true, null];
            else return [false, null];
          }
          default: {
            return [false, null];
          }
        }
      }

      case CADENCE_ACTIONS.REASSIGN: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            // If cadence is personal cadence, then user should be the creator of the cadence if he wants to reassign
            if (
              cadence.type === CADENCE_TYPES.PERSONAL &&
              cadence.user_id === user.user_id
            )
              return [true, null];
            else return [false, null];
          }
          //case USER_ROLE.SALES_MANAGER: {
          //// If cadence is team cadence then it should belong to the manager's sd.
          //// If cadence is personal cadence then it should belong to the manager's sd.
          //if (
          //(cadence.type === CADENCE_TYPES.PERSONAL &&
          //cadence.User.sd_id === user.sd_id) ||
          //(cadence.type === CADENCE_TYPES.TEAM &&
          //cadence.sd_id === user.sd_id)
          //)
          //return [true, null];
          //else return [false, null];
          //}
          case USER_ROLE.SALES_MANAGER:
          case USER_ROLE.SUPER_ADMIN:
          case USER_ROLE.ADMIN: {
            // Can reassign in any company cadence, irrespective of cadence type or cadence creator
            if (cadence.User.company_id === user.company_id)
              return [true, null];
            else return [false, null];
          }
          default: {
            return [false, null];
          }
        }
      }

      default: {
        return [false, null];
      }
    }
  } catch (err) {
    logger.error('Error while checking cadence access:', err);
    return [null, err.message];
  }
};

module.exports = checkCadenceActionAccess;
