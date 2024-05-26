// Utils
const logger = require('../../utils/winston');
const {
  USER_ROLE,
  TEMPLATE_LEVEL,
  TEMPLATE_ACTIONS,
} = require('../../utils/enums');

// user => the currently logged in user
// tenplate.level => Template level after sharing to new one
// data.ogTemplate?.level => Current template level

const checkTemplateActionAccess = ({ template, user, action, data }) => {
  // console.log('------------');
  // console.log('Template');
  // console.log(template);
  // console.log('------------');
  // console.log('User');
  // console.log(user);
  // console.log('------------');
  // console.log('action');
  // console.log(action);
  // console.log('------------');
  // console.log('data');
  // console.log(data);
  try {
    switch (action) {
      case TEMPLATE_ACTIONS.CREATE: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            if (
              template.level === TEMPLATE_LEVEL.PERSONAL &&
              template.user_id == user.user_id
            )
              return [true, null];
            else return [false, null];
          }

          case USER_ROLE.SALES_MANAGER: {
            if (
              (template.level === TEMPLATE_LEVEL.PERSONAL &&
                template.user_id === user.user_id) ||
              (template.level === TEMPLATE_LEVEL.TEAM &&
                template.sd_id === user.sd_id)
            )
              return [true, null];
            else return [false, null];
          }
          case USER_ROLE.SUPER_ADMIN:
          case USER_ROLE.ADMIN: {
            if (template.user_id === user.user_id) return [true, null];
          }
        }
        return [false, null];
      }
      case TEMPLATE_ACTIONS.READ: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            if (
              template.level === TEMPLATE_LEVEL.PERSONAL &&
              template.user_id === user.user_id
            )
              return [true, null];
            else return [false, null];
          }

          case USER_ROLE.SALES_MANAGER: {
            if (
              (template.level === TEMPLATE_LEVEL.PERSONAL &&
                template.user_id === user.user_id) ||
              (template.level === TEMPLATE_LEVEL.TEAM &&
                template.sd_id === user.sd_id)
            )
              return [true, null];
            else return [false, null];
          }

          case USER_ROLE.ADMIN:
          case USER_ROLE.SUPER_ADMIN: {
            if (
              [TEMPLATE_LEVEL.PERSONAL, TEMPLATE_LEVEL.TEAM].includes(
                template.level
              ) ||
              (template.level === TEMPLATE_LEVEL.COMPANY &&
                template.company_id === user.company_id)
            )
              return [true, null];
            else return [false, null];
          }
        }
      }
      case TEMPLATE_ACTIONS.UPDATE:

      case TEMPLATE_ACTIONS.DELETE: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            if (
              template.level === TEMPLATE_LEVEL.PERSONAL &&
              template.user_id == user.user_id
            )
              return [true, null];
          }

          case USER_ROLE.SALES_MANAGER:
            if (
              (template.level === TEMPLATE_LEVEL.PERSONAL &&
                template.user_id == user.user_id) ||
              (template.level === TEMPLATE_LEVEL.TEAM &&
                template.sd_id === user.sd_id)
            )
              return [true, null];

          case USER_ROLE.ADMIN:
          case USER_ROLE.SUPER_ADMIN:
            if (
              (template.level === TEMPLATE_LEVEL.PERSONAL &&
                template.user_id === user.user_id) ||
              (template.level !== TEMPLATE_LEVEL.PERSONAL &&
                template.User?.company_id === user.company_id) ||
              (template.level !== TEMPLATE_LEVEL.PERSONAL &&
                template.company_id === user.company_id)
            )
              return [true, null];
        }
      }

      case TEMPLATE_ACTIONS.DUPLICATE: {
        switch (user.role) {
          case USER_ROLE.SALES_PERSON: {
            if (
              data?.ogTemplate?.level === TEMPLATE_LEVEL.PERSONAL &&
              template.level === TEMPLATE_LEVEL.PERSONAL &&
              template.user_id === user.user_id
            )
              return [true, null];
          }

          case USER_ROLE.SALES_MANAGER: {
            if (
              (data?.ogTemplate?.level === TEMPLATE_LEVEL.PERSONAL &&
                template.level === TEMPLATE_LEVEL.PERSONAL &&
                template.user_id === user.user_id) ||
              (data?.ogTemplate?.level === TEMPLATE_LEVEL.TEAM &&
                template.level === TEMPLATE_LEVEL.TEAM &&
                template.sd_id === user.sd_id)
            )
              return [true, null];
          }

          case USER_ROLE.ADMIN:
          case USER_ROLE.SUPER_ADMIN: {
            if (
              data?.ogTemplate?.level === TEMPLATE_LEVEL.PERSONAL &&
              template.level === TEMPLATE_LEVEL.PERSONAL &&
              template.user_id === user.user_id
            )
              return [true, null];
            if (
              data?.ogTemplate?.level === TEMPLATE_LEVEL.TEAM &&
              template.level === TEMPLATE_LEVEL.TEAM &&
              template.sd_id === user.sd_id
              // &&
              // template.user_id === user.user_id
            )
              return [true, null];
            if (
              data?.ogTemplate?.level === TEMPLATE_LEVEL.COMPANY &&
              template.level === TEMPLATE_LEVEL.COMPANY
              // &&
              // template.company_id === user.company_id
            )
              return [true, null];
            return [false, null];
          }
        }
      }

      case TEMPLATE_ACTIONS.SHARE: {
        switch (user.role) {
          // a salesperson can share a personal template with
          case USER_ROLE.SALES_PERSON:
          case USER_ROLE.SALES_MANAGER:
          case USER_ROLE.ADMIN:
          case USER_ROLE.SUPER_ADMIN: {
            if (
              data?.ogTemplate?.level === TEMPLATE_LEVEL.PERSONAL ||
              data?.ogTemplate?.level === TEMPLATE_LEVEL.TEAM
            ) {
              if (
                template.level === TEMPLATE_LEVEL.PERSONAL &&
                data?.toShareUser?.company_id === user.company_id &&
                (data?.toShareUser?.role === USER_ROLE.SALES_PERSON ||
                  data?.toShareUser?.role === USER_ROLE.SALES_MANAGER)
              )
                return [true, null];
              if (
                template.level === TEMPLATE_LEVEL.TEAM &&
                data?.toShareSubDepartment?.sd_id !== user.sd_id &&
                data?.toShareSubDepartment?.Department?.company_id ===
                  user.company_id
              )
                return [true, null];

              if (
                template.level === TEMPLATE_LEVEL.COMPANY &&
                template.company_id === user.company_id
              )
                return [true, null];
            }

            if (data?.ogTemplate?.level === TEMPLATE_LEVEL.COMPANY) {
              if (
                template.level === TEMPLATE_LEVEL.PERSONAL &&
                (data?.toShareUser?.role === USER_ROLE.SALES_PERSON ||
                  data?.toShareUser?.role === USER_ROLE.SALES_MANAGER) &&
                data?.toShareUser?.company_id === user.company_id
              )
                return [true, null];

              if (
                template.level === TEMPLATE_LEVEL.TEAM &&
                data?.toShareSubDepartment?.sd_id !== user.sd_id &&
                data?.toShareSubDepartment?.Department?.company_id ===
                  user.company_id
              )
                return [true, null];
            }

            return [false, null];
          }
        }
      }
    }
  } catch (err) {
    logger.error('Error while checking template access:', err);
    return [null, err.message];
  }
};

module.exports = checkTemplateActionAccess;
