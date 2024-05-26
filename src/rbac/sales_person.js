const { RBAC_RESOURCES } = require('../utils/enums');

module.exports = {
  [RBAC_RESOURCES.LEAD]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.LEAD_PHONE_NUMBER]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.LEAD_EMAIL]: {
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.NOTE]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.ACTIVITY]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
  },
  [RBAC_RESOURCES.AGENDA]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
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
  [RBAC_RESOURCES.EMAIL_SIGNATURE]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
    'delete:own': ['*'],
  },
  [RBAC_RESOURCES.TASK]: {
    'create:own': ['*'],
    'read:own': ['*'],
    'update:own': ['*'],
  },
  [RBAC_RESOURCES.CALENDAR_SETTINGS]: {
    'read:own': ['*'],
    'update:own': ['*'],
  },
  [RBAC_RESOURCES.SALES_DASHBOARD]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.USER]: {
    'read:own': ['*'],
    'update:own': ['*'],
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
  [RBAC_RESOURCES.ENRICHMENTS]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.SUB_DEPARTMENT]: {
    'read:any': ['*'],
  },
  [RBAC_RESOURCES.DEPARTMENT_EMPLOYEES]: {
    'read:own': ['*'],
  },
  [RBAC_RESOURCES.SUB_DEPARTMENT_EMPLOYEES]: {
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
