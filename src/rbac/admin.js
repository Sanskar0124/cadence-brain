const { RBAC_RESOURCES } = require('../utils/enums');

module.exports = {
  [RBAC_RESOURCES.ADMIN_DASHBOARD]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.PAYMENT_DATA]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.ADMIN_LEADERBOARD]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.SUB_DEPARTMENT]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.DEPARTMENT]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.USER]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'read:any': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.COMPANY]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.COMPANY_CALENDAR_SETTINGS]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.COMPANY_SETTINGS]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.COMPANY_HISTORY]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.COMPANY_EMAIL_SETTINGS]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.COMPANY_TOKENS]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.SUB_DEPARTMENT_SETTINGS]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.ADMIN_TASKS_VIEW]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.ADMIN_CADENCES_VIEW]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.SUB_DEPARTMENT_EMPLOYEES]: {
    'read:any': ['*'],
  },
  [RBAC_RESOURCES.DEPARTMENT_EMPLOYEES]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.ADMIN_SIGNED_IN_STATUS]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.ADMIN_EMAIL_TEMPLATES]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.ADMIN_MESSAGE_TEMPLATES]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.ADMIN_LINKEDIN_TEMPLATES]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.ADMIN_SCRIPT_TEMPLATES]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.COMPANY_WORKFLOW]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.ENRICHMENTS]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.API_TOKEN]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.SF_ACTIVITES_TO_LOG]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.CRM_OBJECTS]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.AUTOMATED_TASK_SETTINGS]: {
    'read:own': ['*'],
  },
};
