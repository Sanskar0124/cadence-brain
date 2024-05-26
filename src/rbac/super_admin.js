const { RBAC_RESOURCES } = require('../utils/enums');

module.exports = {
  [RBAC_RESOURCES.COMPANY_INTEGRATION]: {
    'update:any': ['*'],
  },
  [RBAC_RESOURCES.COMPANY_STATUS]: {
    'update:any': ['*'],
  },
  [RBAC_RESOURCES.MAIL_INTEGRATION]: {
    'update:any': ['*'],
  },
};
