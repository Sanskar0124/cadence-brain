const { RBAC_RESOURCES } = require('../utils/enums');

module.exports = {
  [RBAC_RESOURCES.LEAD]: {
    'read:any': ['*'],
    'update:any': ['*'],
    'delete:any': ['*'],
  },
  [RBAC_RESOURCES.LEAD_PHONE_NUMBER]: {
    'read:any': ['*'],
    'update:any': ['*'],
    'delete:any': ['*'],
  },
  [RBAC_RESOURCES.LEAD_EMAIL]: {
    'read:any': ['*'],
    'update:any': ['*'],
    'delete:any': ['*'],
  },
  [RBAC_RESOURCES.ACTIVITY]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'read:any': ['*'],
  },
  [RBAC_RESOURCES.EMAIL_TEMPLATES]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.MESSAGE_TEMPLATES]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.LINKEDIN_TEMPLATES]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.SCRIPT_TEMPLATES]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.EMAIL_SIGNATURE]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.CADENCE]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.NODE]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.TASK]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'read:any': ['*'],
  },
  [RBAC_RESOURCES.CALENDAR_SETTINGS]: {
    'read:own': ['*'],
    'update:own': ['*'],
  },
  [RBAC_RESOURCES.MANAGER_DASHBOARD]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.MANAGER_LEADERBOARD]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.USER]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.SUB_DEPARTMENT]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.SUB_DEPARTMENT_SETTINGS]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
    'create:own': ['*'],
  },
  [RBAC_RESOURCES.MANAGER_TASKS_VIEW]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.SUB_DEPARTMENT_EMPLOYEES]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.MANAGER_EMAIL_TEMPLATES]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
    'create:own': ['*'],
  },
  [RBAC_RESOURCES.MANAGER_MESSAGE_TEMPLATES]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
    'create:own': ['*'],
  },
  [RBAC_RESOURCES.MANAGER_LINKEDIN_TEMPLATES]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
    'create:own': ['*'],
  },
  [RBAC_RESOURCES.MANAGER_SCRIPT_TEMPLATES]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
    'create:own': ['*'],
  },
  [RBAC_RESOURCES.NOTE]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.ENRICHMENTS]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.DEPARTMENT_EMPLOYEES]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.CRM_OBJECTS]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.CADENCE_WORKFLOW]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.AUTOMATED_TASK_SETTINGS]: {
    'read:own': ['*'],
  },
};
