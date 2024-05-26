// roles for a employee
const USER_ROLE = {
  SALES_MANAGER: 'sales_manager',
  SALES_PERSON: 'sales_person',
  SALES_INBOUND: 'sales_inbound',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  SALES_MANAGER_PERSON: 'sales_manager_person',
  CADENCE_SALES: 'cadence_sales',
  SUPPORT_AGENT: 'support_agent',
  SUPPORT_ADMIN: 'support_admin',
};

// statuses of leads
const LEAD_STATUS = {
  UNASSIGNED: 'unassigned',
  NEW_LEAD: 'new_lead',
  ONGOING: 'ongoing',
  CONVERTED: 'converted',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  TRASH: 'trash',
};
const OPPORTUNITY_STATUS = {
  WON: 'won',
  LOST: 'lost',
  OPEN: 'open',
};

const AGENDA_TYPE = {
  VOICE_CALL: 'voice_call',
  MESSAGE: 'message',
  MAIL: 'mail',
  MEETING: 'meeting',
  VIDEO_CALL: 'video_call',
};

const AGENDA_FILTERS = {
  TODAY: 'today',
  TOMMORROW: 'tommorrow',
  THIS_WEEK: 'this_week',
  NEXT_WEEK: 'next_week',
  COMPLETED: 'completed',
};

const ACTIVITY_TYPE = {
  CALL: 'call',
  CALLBACK: 'callback',
  MESSAGE: 'message',
  MAIL: 'mail',
  MEETING: 'meeting',
  NOTE: 'note',
  CADENCE_CUSTOM: 'cadence_custom',
  DATA_CHECK: 'data_check',
  AUTOMATED_MAIL: 'automated_mail',
  AUTOMATED_MESSAGE: 'automated_message',
  LINKEDIN_CONNECTION: 'linkedin_connection',
  LINKEDIN_MESSAGE: 'linkedin_message',
  LINKEDIN_PROFILE: 'linkedin_profile',
  LINKEDIN_INTERACT: 'linkedin_interact',
  WHATSAPP: 'whatsapp',
  PAUSE_CADENCE: 'pause_cadence',
  REPLY_TO: 'reply_to',
  VIEWED_MAIL: 'viewed_mail',
  CLICKED_MAIL: 'clicked_mail',
  CLICKED_MESSAGE: 'clicked_message',
  BOUNCED_MAIL: 'bounced_mail',
  OUT_OF_OFFICE: 'out_of_office',
  RESUME_CADENCE: 'resume_cadence',
  STOP_CADENCE: 'stop_cadence',
  MOVE_CADENCE: 'move_cadence',
  COMPLETED_CADENCE: 'completed_cadence',
  LEAD_CONVERTED: 'lead_converted',
  LEAD_DISQUALIFIED: 'lead_disqualified',
  CONTACT_DISQUALIFIED: 'contact_disqualified',
  LAUNCH_CADENCE: 'launch_cadence',
  UNSUBSCRIBE: 'unsubscribe',
  TASK_SKIPPED: 'task_skipped',
  LEAD_DELETE: 'lead_delete',
  OWNER_CHANGED_TEAM: 'owner_changed_team',
  CUSTOM_TASK_FOR_OTHER: 'custom_task_for_other',
  OWNER_CHANGE: 'owner_change',
  CUSTOM_TASK: 'custom_task',
  HOT_LEAD: 'hot_lead',
  EXPORTED_LEAD: 'exported_lead',
  UNLINKED_LEAD: 'unlinked_lead',
};

const LEAD_TYPE = {
  HEADER_FORM: 'header_form',
  POPIN_SALES_CONTACT: 'popin_sales_contact',
  TRIAL_NOT_COMPLETED: 'essai_gratuit_non_termin_',
  TRIAL_COMPLETED: 'essai_gratuit_termin_',
  TEST_WEB: 'test_web',
  EBOOK: 'Ebook',
  DEMAND_DE_CONTACT: 'Demande_de_contact',
  AUTOMATION_TOOL: 'automation_tool',
};

const MESSAGE_EVENT = {
  SENT: 'sent',
  RECIEVED: 'received',
};

const CALL_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  IN: 'in',
  OUT: 'out',
};

const TEMPLATE_TYPE = {
  EMAIL: 'email',
  SMS: 'sms',
  LINKEDIN: 'linkedin',
  WHATSAPP: 'whatsapp',
  SCRIPT: 'script',
  VIDEO: 'video',
};

const TEMPLATE_LEVEL = {
  PERSONAL: 'personal',
  TEAM: 'team',
  COMPANY: 'company',
};

const TEMPLATE_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  DUPLICATE: 'duplicate',
  SHARE: 'share',
};
const ACCOUNT_SIZE = [
  '0',
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000-10000',
  '10000+',
];

const EMAIL_STATUS = {
  DELIVERED: 'delivered',
  BOUNCED: 'bounced',
  OPENED: 'opened',
  CLICKED: 'clicked',
  UNSUBSCRIBED: 'unsubscribed',
};

const SMS_STATUS = {
  DELIVERED: 'delivered',
  CLICKED: 'clicked',
};

const LIVE_FEED_FILTER = {
  ALL: 'all',
  VIEWED_MAILS: 'viewed_mails',
  CLICKED_MAILS: 'clicked_mails',
  BOUNCED_MAILS: 'bounced_mails',
  REPLIED_MAILS: 'replied_mails',
  UNSUBSCRIBED_MAILS: 'unsubscribed_mails',
  RECEIVED_MAILS: 'received_mails',
  RECEIVED_SMS: 'received_sms',
  VOICEMAIL: 'voicemail',
  MISSED_CALLS: 'missed_calls',
  RECEIVED_CALLS: 'received_calls',
  REJECTED_CALLS: 'rejected_calls',
  HOT_LEADS: 'hot_leads',
};

const HOMEPAGE_ACTIVE_CADENCE_TYPE = {
  URGENT: 'urgent',
  LATE: 'late',
};

const METRICS_FILTER = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
};

const NODE_TYPES = {
  MAIL: 'mail',
  REPLY_TO: 'reply_to',
  AUTOMATED_REPLY_TO: 'automated_reply_to',
  AUTOMATED_MAIL: 'automated_mail',
  CALL: 'call',
  MESSAGE: 'message',
  AUTOMATED_MESSAGE: 'automated_message',
  LINKEDIN_CONNECTION: 'linkedin_connection',
  LINKEDIN_MESSAGE: 'linkedin_message',
  LINKEDIN_PROFILE: 'linkedin_profile',
  LINKEDIN_INTERACT: 'linkedin_interact',
  AUTOMATED_LINKEDIN_CONNECTION: 'automated_linkedin_connection',
  AUTOMATED_LINKEDIN_MESSAGE: 'automated_linkedin_message',
  AUTOMATED_LINKEDIN_PROFILE: 'automated_linkedin_profile',
  WHATSAPP: 'whatsapp',
  DATA_CHECK: 'data_check',
  CADENCE_CUSTOM: 'cadence_custom',
  DONE_TASKS: 'done_tasks',
  END: 'end',
  CALLBACK: 'callback',
  OTHER: 'other',
};

const AUTOMATED_NODE_TYPES_ARRAY = [
  NODE_TYPES.AUTOMATED_MAIL,
  NODE_TYPES.AUTOMATED_MESSAGE,
  NODE_TYPES.AUTOMATED_REPLY_TO,
];

const HEATMAP_OPTIONS = {
  DONE_TASKS: 'done_tasks',
};

const NODE_DATA = {
  MAIL: {
    subject: '',
    body: '',
    attachments: [], // * array of attachment_id's
    templates: [],
    aBTestEnabled: false,
  },
  AUTOMATED_MAIL: {
    subject: '',
    body: '',
    attachments: [], // * array of attachment_id's
    templates: [],
    aBTestEnabled: false,
  },
  CALL: {
    script: '',
  },
  MESSAGE: {
    message: '',
  },
  AUTOMATED_MESSAGE: {
    message: '',
  },
  LINKEDIN_CONNECTION: {
    message: '',
  },
  LINKEDIN_MESSAGE: {
    message: '',
  },
  LINKEDIN_PROFILE: {
    message: '',
  },
  LINKEDIN_INTERACT: {
    message: '',
  },
  AUTOMATED_LINKEDIN_CONNECTION: {
    message: '',
  },
  AUTOMATED_LINKEDIN_MESSAGE: {
    message: '',
  },
  AUTOMATED_LINKEDIN_PROFILE: {
    message: '',
  },
  LINKEDIN: {
    connection: {
      message: '',
    },
    message: {
      message: '',
    },
    profile: {
      message: '',
    },
    interact: {
      message: '',
    },
  },
  WHATSAPP: {
    message: '',
  },
  END: {
    cadence_id: '',
    account_status: '',
    account_reason: '',
    contact_status: '',
    contact_reason: '',
    lead_status: '',
    lead_reason: '',
    to_user_id: '',
    moved_leads: [],
  },
  DATA_CHECK: {
    message: '',
  },
  CADENCE_CUSTOM: {
    message: '',
  },
  REPLY_TO: {
    replied_node_id: '',
    body: '',
    attachments: [], // * array of attachment_id's
    templates: [],
    aBTestEnabled: false,
  },
  AUTOMATED_REPLY_TO: {
    replied_node_id: '',
    body: '',
    attachments: [], // * array of attachment_id's
    templates: [],
    aBTestEnabled: false,
  },
  CALLBACK: {
    duration: '',
    retry_after: '',
    retries: '',
    script: '',
  },
};

const LEADERBOARD_DATE_FILTERS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_WEEK: 'last_week',
  LAST_MONTH: 'last_month',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  LAST_3_MONTHS: 'last_3_months',
  LAST_6_MONTHS: 'last_6_months',
};

const TASK_FILTERS = {
  FIRST_IN_LAST_OUT: 'first_in_last_out',
  SORT_BY_SIZE: 'sort_by_size',
  SORT_BY_STEP: 'sort_by_step',
  SORT_BY_TAG: 'sort_by_tag',
  GROUP_BY_COMPANY: 'group_by_company',
  INTERACTIONS_ONLY: 'interactions_only',
  CUSTOM_TASK: 'custom_task',
  TOMORROW_TASK: 'tomorrow_task',
};

const TAG_NAME = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
};

const SORT_TYPES = {
  ASC: 'ASC',
  DESC: 'DESC',
  ONLY: 'only', // * for custom task
  WITHOUT: 'without', // * for custom task
};

const SMART_ACTION_TYPE = {
  VOICE_CALL: 'voice_call',
  MESSAGE: 'message',
  MAIL: 'mail',
  MEETING: 'meeting',
  VIDEO_CALL: 'video_call',
};

const RBAC_ACTIONS = {
  CREATE_ANY: 'createAny',
  CREATE_OWN: 'createOwn',
  READ_ANY: 'readAny',
  READ_OWN: 'readOwn',
  UPDATE_ANY: 'updateAny',
  UPDATE_OWN: 'updateOwn',
  DELETE_ANY: 'deleteAny',
  DELETE_OWN: 'deleteOwn',
};

const RBAC_RESOURCES = {
  LEAD: 'lead',
  LEAD_PHONE_NUMBER: 'lead_phone_number',
  LEAD_EMAIL: 'lead_email',
  NOTE: 'note',
  OPPORTUNITY: 'opportunity',
  ACTIVITY: 'activity',
  AGENDA: 'agenda',
  EMAIL_TEMPLATES: 'email_templates',
  MANAGER_EMAIL_TEMPLATES: 'manager_email_templates',
  ADMIN_EMAIL_TEMPLATES: 'admin_email_templates',
  MESSAGE_TEMPLATES: 'message_templates',
  MANAGER_MESSAGE_TEMPLATES: 'manager_message_templates',
  ADMIN_MESSAGE_TEMPLATES: 'admin_message_templates',
  LINKEDIN_TEMPLATES: 'linkedin_templates',
  MANAGER_LINKEDIN_TEMPLATES: 'manager_linkedin_templates',
  ADMIN_LINKEDIN_TEMPLATES: 'admin_linkedin_templates',
  SCRIPT_TEMPLATES: 'script_templates',
  MANAGER_SCRIPT_TEMPLATES: 'manager_script_templates',
  ADMIN_SCRIPT_TEMPLATES: 'admin_script_templates',
  EMAIL_SIGNATURE: 'email_signature',
  CADENCE: 'cadence',
  NODE: 'node',
  LIST: 'list',
  TASK: 'task',
  CALENDAR_SETTINGS: 'calendar_settings',
  SALES_DASHBOARD: 'sales_dashboard',
  MANAGER_DASHBOARD: 'manager_dashboard',
  ADMIN_DASHBOARD: 'admin_dashboard',
  MANAGER_LEADERBOARD: 'manager_leaderboard',
  ADMIN_LEADERBOARD: 'admin_leaderboard',
  SUB_DEPARTMENT: 'subdepartment',
  DEPARTMENT: 'department',
  USER: 'user',
  COMPANY: 'company',
  COMPANY_CALENDAR_SETTINGS: 'company_calendar_settings',
  COMPANY_EMAIL_SETTINGS: 'company_email_settings',
  COMPANY_SETTINGS: 'comapany_settings',
  COMPANY_HISTORY: 'company_history',
  COMPANY_TOKENS: 'company_tokens',
  SUB_DEPARTMENT_SETTINGS: 'sub_department_settings',
  SALESPERSON_TASKS_VIEW: 'sales_tasks_view',
  MANAGER_TASKS_VIEW: 'manager_tasks_view',
  ADMIN_TASKS_VIEW: 'admin_tasks_view',
  ADMIN_CADENCES_VIEW: 'admin_cadences_view',
  SUB_DEPARTMENT_EMPLOYEES: 'sub_department_employees',
  DEPARTMENT_EMPLOYEES: 'department_employees',
  ADMIN_SIGNED_IN_STATUS: 'admin_signed_in_status',
  COMPANY_WORKFLOW: 'company_workflow',
  ENRICHMENTS: 'enrichments',
  API_TOKEN: 'api_token',
  SF_ACTIVITES_TO_LOG: 'sf_activity_to_log',
  VIDEO: 'video',
  VIDEO_TRACKING: 'video_tracking',
  PAYMENT_DATA: 'payment_data',
  CRM_OBJECTS: 'crm_objects',
  CADENCE_WORKFLOW: 'cadence_workflow',
  AUTOMATED_TASK_SETTINGS: 'automated_task_settings',
  COMPANY_INTEGRATION: 'company_integration',
  COMPANY_STATUS: 'company_status',
  MAIL_INTEGRATION: 'mail_integration',
};

const CADENCE_STATUS = {
  NOT_STARTED: 'not_started',
  PROCESSING: 'processing',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  SCHEDULED: 'scheduled',
};

const CADENCE_LEAD_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  COMPLETED: 'completed',
};

const CADENCE_LEAD_ACTIONS = {
  PAUSE: 'pause',
  STOP: 'stop',
  RESUME: 'resume',
};

const CADENCE_PRIORITY = {
  STANDARD: 'standard',
  HIGH: 'high',
};

const LIST_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  NOT_IN_PROGRESS: 'not_in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

const MONITORING_LEAD_STATUS = {
  IN_QUEUE: 'in_queue',
  IN_PROGRESS: 'in_progress',
};

// call state that is fetched from ringover's call api
const RINGOVER_CALL_STATES = {
  ANSWERED: 'ANSWERED',
  MISSED: 'MISSED',
  FAILED: 'FAILED',
  NOANSWER_TRANSFERED: 'NOANSWER_TRANSFERED',
};

const USER_DELETE_OPTIONS = {
  REASSIGN: 'reassign',
  UNASSIGN: 'unassign',
  DELETE_ALL: 'delete_all',
};

const LUSHA_KASPR_OPTIONS = {
  UPDATE: 'update',
  ADD: 'add',
};

const SALESFORCE_PHONE_NUMBER_FIELDS = {
  MOBILE_PHONE: 'MobilePhone',
  PHONE: 'Phone',
  HOME_PHONE: 'HomePhone',
  OTHER_PHONE: 'OtherPhone',
};

const GOOGLE_SHEETS_PHONE_NUMBER_FIELDS = {
  PRIMARY: 'Primary Phone',
  WORK_PHONE: 'Work Phone',
  HOME_PHONE: 'Home Phone',
  OTHER_PHONE: 'Other Phone',
};

const EXCEL_PHONE_NUMBER_FIELDS = {
  PRIMARY: 'Primary Phone',
  WORK_PHONE: 'Work Phone',
  HOME_PHONE: 'Home Phone',
  OTHER_PHONE: 'Other Phone',
};

const GOOGLE_SHEETS_EMAIL_FIELDS = {
  PRIMARY: 'Primary Email',
  WORK_EMAIL: 'Work Email',
  HOME_EMAIL: 'Home Email',
  OTHER_EMAIL: 'Other Email',
};

const EXCEL_EMAIL_FIELDS = {
  PRIMARY: 'Primary Email',
  WORK_EMAIL: 'Work Email',
  HOME_EMAIL: 'Home Email',
  OTHER_EMAIL: 'Other Email',
};

const SETTING_LEVELS = {
  ADMIN: 3,
  SUB_DEPARTMENT: 2,
  USER: 1,
};

const SETTING_TYPES = {
  AUTOMATED_TASK_SETTINGS: 'automated_task_settings',
  UNSUBSCRIBE_MAIL_SETTINGS: 'unsubscribe_mail_settings',
  BOUNCED_MAIL_SETTINGS: 'bounced_mail_settings',
  TASK_SETTINGS: 'task_settings',
  SKIP_SETTINGS: 'skip_settings',
  CUSTOM_DOMAIN_SETTINGS: 'custom_domain_settings',
  LEAD_SCORE_SETTINGS: 'lead_score_settings',
};

const MAIL_SETTING_TYPES = {
  BOUNCE: 'bounce',
  UNSUBSCRIBE: 'unsubscribe',
};

const DELAY_BETWEEN_EMAILS_OPTIONS = {
  RANDOM: 'random',
  FIXED: 'fixed',
};

const TASKS_FILTERS_REQUEST_VALUES = {
  TASK_TYPE_ASSIGNED: 'task_assigned',
  TASK_TYPE_CUSTOM: 'task_custom',
  TASK_ACTION_CALL: 'task_action_call',
  TASK_ACTION_LINKEDIN_CONNECTION: 'task_action_linkedin_connection',
  TASK_ACTION_LINKEDIN_MESSAGE: 'task_action_linkedin_message',
  TASK_ACTION_LINKEDIN_PROFILE: 'task_action_linkedin_profile',
  TASK_ACTION_LINKEDIN_INTERACT: 'task_action_linkedin_interact',
  TASK_ACTION_REPLY_TO: 'task_action_reply_to',
  TASK_ACTION_EMAIL: 'task_action_email',
  TASK_ACTION_SMS: 'task_action_sms',
  TASK_ACTION_DATA_CHECK: 'task_action_data_check',
  TASK_ACTION_CADENCE_CUSTOM: 'task_action_cadence_custom',
  TASK_ACTION_WHATSAPP: 'task_action_whatsapp',
  TASK_COMPLETION_DUE: 'task_completion_due',
  TASK_COMPLETION_SCHEDULED: 'task_completion_scheduled',
  TASK_COMPLETION_DONE: 'task_completion_done',
  COMPANY_SIZE: '',
  //COMPANY_SIZE_1_10: 'company_size_1_10',
  //COMPANY_SIZE_11_50: 'company_size_11_50',
  //COMPANY_SIZE_51_200: 'company_size_51_200',
  //COMPANY_SIZE_201_500: 'company_size_201_500',
  //COMPANY_SIZE_501_1000: 'company_size_501_1000',
  //COMPANY_SIZE_1001_5000: 'company_size_1001_5000',
  //COMPANY_SIZE_5000_10000: 'company_size_5000_10000',
  //COMPANY_SIZE_10000: 'company_size_10000',
  FAVOURITE: 'favourite',
  TASK_DATE_CREATION_TODAY: 'task_date_creation_today',
  TASK_DATE_CREATION_YESTERDAY: 'task_date_creation_yesterday',
  TASK_TAG_URGENT: 'task_tag_urgent',
  TASK_TAG_LATE: 'task_tag_late',
  LEAD_TAG_HOT: 'lead_tag_hot',
};

const TASKS_FILTERS_REQUEST_KEYS = {
  TASK_TYPE: 'task_type',
  TASK_ACTION: 'task_action',
  TASK_COMPLETION: 'task_completion',
  COMPANY_SIZE: 'company_size',
  FAVORITE: 'favorite',
  TASK_DATE_CREATION: 'task_date_creation',
  TASK_CADENCES: 'task_cadences',
  TASK_TAG: 'task_tag',
  TASK_STEP: 'task_step',
  LEAD_TAG: 'lead_tag',
  LEAD_TIMEZONES: 'lead_timezones',
};

const DAYS_OF_WEEK = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday',
};
const COMPANY_ACCOUNT_REASSIGNMENT_OPTIONS = {
  ACCOUNT_ONLY: 'change_only_account_owner',
  ACCOUNT_AND_CONTACT: 'change_contact_and_account_owner',
};

const COMPANY_CONTACT_REASSIGNMENT_OPTIONS = {
  CONTACT_ONLY: 'change_only_contact_owner',
  CONTACT_AND_ACCOUNT: 'change_contact_and_account_owner',
  CONTACT_ACCOUNT_AND_OTHER_CONTACTS:
    'change_contact_account_and_other_contacts_owner',
};

// If a new custom task node id is added, make sure to alter the uniqueIndex on task
const CUSTOM_TASK_NODE_ID = {
  call: 1,
  message: 2,
  mail: 3,
  linkedin_connection: 4,
  whatsapp: 5,
  other: 6,
};

const SALESFORCE_DATA_IMPORT_TYPES = {
  CONTACT: 'contact',
  LEAD: 'lead',
  CONTACT_LIST: 'contact_list',
  LEAD_LIST: 'lead_list',
};

const SALESFORCE_LEAD_IMPORT_STATUS = {
  USER_NOT_PRESENT: 'user_not_present',
  LEAD_PRESENT_IN_TOOL: 'lead_present_in_tool',
  LEAD_ABSENT_IN_TOOL: 'lead_absent_in_tool',
  LEAD_INACTIVE: 'lead_inactive',
  COMPANY_NOT_PRESENT: 'company_not_present',
};

const HUBSPOT_CONTACT_IMPORT_STATUS = {
  USER_NOT_PRESENT: 'user_not_present',
  COMPANY_NOT_PRESENT: 'company_not_present',
  LEAD_PRESENT_IN_TOOL: 'lead_present_in_tool',
  LEAD_ABSENT_IN_TOOL: 'lead_absent_in_tool',
  UNASSIGNED: 'unassigned',
};

const SELLSY_CONTACT_IMPORT_STATUS = {
  USER_NOT_PRESENT: 'user_not_present',
  COMPANY_NOT_PRESENT: 'company_not_present',
  LEAD_PRESENT_IN_TOOL: 'lead_present_in_tool',
  LEAD_ABSENT_IN_TOOL: 'lead_absent_in_tool',
  UNASSIGNED: 'unassigned',
  INVALID_CONTACT_ID: 'invalid_contact_id',
  FIRST_NAME_NOT_PRESENT: 'first_name_not_present',
};

const SALESFORCE_SOBJECTS = {
  LEAD: 'lead',
  CONTACT: 'contact',
  ACCOUNT: 'account',
  OPPORTUNITY: 'opportunity',
  USER: 'user',
};

const RESPONSE_STATUS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  REDIRECT: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTRY: 422,
  INTERNAL_ERROR: 500,
};

const INTEGRATION_TYPE = {
  GOOGLE: 'google',
  SALESFORCE: 'salesforce',
  OUTLOOK: 'outlook',
};

const CALENDAR_INTEGRATION_TYPES = {
  GOOGLE: 'google',
  OUTLOOK: 'outlook',
};

const LEADS_FILTER_KEYS = {
  LEAD_TAGS: 'lead_tags',
  COMPANY_SIZE: 'company_size',
  LEAD_CADENCES: 'lead_cadences',
  LEAD_ACTIVITY: 'lead_activity',
};

const LEADS_FILTER_VALUES = {
  LEAD_TAGS_NEW: 'lead_tags_new',
  LEAD_TAGS_DUPLICATED: 'lead_tags_duplicated',
  LEAD_TAGS_CONVERTED: 'lead_tags_converted',
  LEAD_TAGS_DISQUALIFIED: 'lead_tags_disqualified',
  LEAD_TAGS_HOT: 'lead_tags_hot',
  COMPANY_SIZE_1_10: 'company_size_1_10',
  COMPANY_SIZE_11_50: 'company_size_11_50',
  COMPANY_SIZE_51_200: 'company_size_51_200',
  COMPANY_SIZE_201_500: 'company_size_201_500',
  COMPANY_SIZE_501_1000: 'company_size_501_1000',
  COMPANY_SIZE_1001_5000: 'company_size_1001_5000',
  COMPANY_SIZE_5000_10000: 'company_size_5000_10000',
  COMPANY_SIZE_10000: 'company_size_10000',
  LEAD_ACTIVITY_EMAIL: 'lead_activity_email',
  LEAD_ACTIVITY_SMS: 'lead_activity_sms',
};

const CADENCE_TYPES = {
  PERSONAL: 'personal',
  TEAM: 'team',
  COMPANY: 'company',
  RECENT: 'recent',
};

const CADENCE_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  DUPLICATE: 'duplicate',
  SHARE: 'share',
  REASSIGN: 'reassign',
};

const WORKFLOW_TRIGGERS = {
  WHEN_A_CADENCE_ENDS: 'when_a_cadence_ends',
  WHEN_AN_EMAIL_BOUNCES: 'when_an_email_bounces',
  WHEN_PEOPLE_UNSUBSCRIBE: 'when_people_unsubscribe',
  WHEN_OWNERSHIP_CHANGES_IN_CADENCE: 'when_ownership_changes_in_cadence',
  WHEN_YOU_CREATE_CUSTOM_TASK: 'when_you_create_custom_task',
  WHEN_PEOPLE_REPLY_TO_EMAIL: 'when_people_reply_to_email',
  WHEN_A_CADENCE_IS_MANUALLY_STOPPED: 'when_a_cadence_is_manually_stopped',
  WHEN_A_CADENCE_IS_PAUSED: 'when_a_cadence_is_paused',
  WHEN_A_OWNER_CHANGES: 'when_a_owner_changes',
  WHEN_A_TASK_IS_SKIPPED: 'when_a_task_is_skipped',
  WHEN_PEOPLE_CALL: 'when_people_call',
  WHEN_FIRST_MANUAL_TASK_IS_COMPLETED: 'when_first_manual_task_is_completed',
  WHEN_FIRST_AUTOMATED_TASK_IS_COMPLETED:
    'when_first_automated_task_is_completed',
  WHEN_A_DEMO_IS_BOOKED_VIA_CALENDLY: 'when_a_demo_is_booked_via_calendly',
  WHEN_A_CUSTOM_LINK_CLICKED: 'when_a_custom_link_clicked',
  WHEN_CALL_DURATION_IS_GREATER_THAN: 'when_call_duration_is_greater_than',
  WHEN_A_LEAD_IS_ADDED_TO_CADENCE: 'when_a_lead_is_added_to_cadence',
  WHEN_AN_EMAIL_IS_OPENED: 'when_an_email_is_open',
  WHEN_A_LEAD_INTEGRATION_STATUS_IS_UPDATED:
    'when_a_lead_integration_status_is_updated',
  WHEN_A_ACCOUNT_INTEGRATION_STATUS_IS_UPDATED:
    'when_a_account_integration_status_is_updated',
  WHEN_A_CONTACT_INTEGRATION_STATUS_IS_UPDATED:
    'when_a_contact_integration_status_is_updated',
  WHEN_A_CANDIDATE_INTEGRATION_STATUS_IS_UPDATED:
    'when_a_candidate_integration_status_is_updated',
};

const WORKFLOW_ACTIONS = {
  CHANGE_OWNER: 'change_owner',
  STOP_CADENCE: 'stop_cadence',
  PAUSE_CADENCE: 'pause_cadence',
  MOVE_TO_ANOTHER_CADENCE: 'move_to_another_cadence',
  CONTINUE_CADENCE: 'continue_cadence',
  CHANGE_INTEGRATION_STATUS: 'change_integration_status',
  GO_TO_LAST_STEP_OF_CADENCE: 'go_to_last_step_of_cadence',
};

const WORKFLOW_DEFAULT_NAMES = {
  [WORKFLOW_TRIGGERS.WHEN_A_CADENCE_ENDS]: 'Cadence Ends',
  [WORKFLOW_TRIGGERS.WHEN_AN_EMAIL_BOUNCES]: 'Email Bounces',
  [WORKFLOW_TRIGGERS.WHEN_PEOPLE_UNSUBSCRIBE]: 'People Unsubscribe',
  [WORKFLOW_TRIGGERS.WHEN_OWNERSHIP_CHANGES_IN_CADENCE]:
    'Ownership Changes in Cadence',
  [WORKFLOW_TRIGGERS.WHEN_YOU_CREATE_CUSTOM_TASK]: 'Create Custom task',
  [WORKFLOW_TRIGGERS.WHEN_PEOPLE_REPLY_TO_EMAIL]: 'People Reply To email',
  [WORKFLOW_TRIGGERS.WHEN_A_CADENCE_IS_MANUALLY_STOPPED]:
    'Cadence is Manually Stopped',
  [WORKFLOW_TRIGGERS.WHEN_A_CADENCE_IS_PAUSED]: 'Cadence is Paused',
  [WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES]: 'Owner Changes',
  [WORKFLOW_TRIGGERS.WHEN_A_TASK_IS_SKIPPED]: 'Task skipped',
  [WORKFLOW_TRIGGERS.WHEN_PEOPLE_CALL]: 'People Call',
  [WORKFLOW_TRIGGERS.WHEN_FIRST_MANUAL_TASK_IS_COMPLETED]:
    'First Manual Task Completed',
  [WORKFLOW_TRIGGERS.WHEN_FIRST_AUTOMATED_TASK_IS_COMPLETED]:
    'First Automated Task Completed',
  [WORKFLOW_TRIGGERS.WHEN_A_DEMO_IS_BOOKED_VIA_CALENDLY]:
    'Demo is Booked via Calendly',
  [WORKFLOW_TRIGGERS.WHEN_A_CUSTOM_LINK_CLICKED]: 'Custom Link Clicked',
  [WORKFLOW_TRIGGERS.WHEN_CALL_DURATION_IS_GREATER_THAN]: 'Call Duration',
  [WORKFLOW_TRIGGERS.WHEN_A_LEAD_IS_ADDED_TO_CADENCE]: 'Lead added to cadence',
  [WORKFLOW_TRIGGERS.WHEN_AN_EMAIL_IS_OPENED]: 'Email opened',
  [WORKFLOW_TRIGGERS.WHEN_A_LEAD_INTEGRATION_STATUS_IS_UPDATED]:
    'Lead integration status is updated',
  [WORKFLOW_TRIGGERS.WHEN_A_CONTACT_INTEGRATION_STATUS_IS_UPDATED]:
    'Contact integration status is updated',
  [WORKFLOW_TRIGGERS.WHEN_A_ACCOUNT_INTEGRATION_STATUS_IS_UPDATED]:
    'Account integration status is updated',
  [WORKFLOW_TRIGGERS.WHEN_A_CANDIDATE_INTEGRATION_STATUS_IS_UPDATED]:
    'Candidate integration status is updated',
};

const PROFILE_IMPORT_TYPES = {
  LEAD: 'lead',
  CONTACT: 'contact',
};

const SALESFORCE_SYNC_OPTIONS = {
  EMAIL: 'email',
  PHONE_NUMBER: 'phone_number',
  ALL: 'all',
};

// * Form elements allowed for custom objects
const FORM_FIELDS_FOR_CUSTOM_OBJECTS = {
  INPUT_BOX: 'input_box',
  DROPDOWN: 'dropdown',
  RADIO_BUTTON: 'radio_button',
  MULTI_SELECT_DROPDOWN: 'multi_select_dropdown',
  INPUT_SELECT: 'input_select',
  TAG: 'tag',
};

const ENRICHMENT_SERVICES = {
  LUSHA: 'lusha',
  KASPR: 'kaspr',
  HUNTER: 'hunter',
  DROPCONTACT: 'dropcontact',
  SNOV: 'snov',
};

const LUSHA_TYPES = {
  PERSONAL: 'personal',
  WORK: 'work',
  OTHER: 'other',
};

const LUSHA_FIELD_MAP = {
  [LUSHA_TYPES.PERSONAL]: 'personal_field',
  [LUSHA_TYPES.WORK]: 'work_field',
  [LUSHA_TYPES.OTHER]: 'other_field',
};

const INTEGRATION_SERVICES = {
  RINGOVER: 'ringover',
};

const CUSTOM_TASK_NODE_NAME = {
  call: 'Call',
  message: 'Message',
  mail: 'Mail',
  linkedin_connection: 'Linkedin',
  whatsapp: 'Whatsapp',
};

const ACTIVITY_SUBTYPES = {
  ANSWERED_WITH_INCALL_DURATION: 'answered_with_incall_duration',
  ANSWERED_WITH_INCALL_DURATION_INCOMING:
    'answered_with_incall_duration_incoming',
  ANSWERED_WITH_TOTAL_DURATION: 'answered_with_total_duration',
  MISSED_INCOMING: 'missed_incoming',
  MISSED_OUTGOING: 'missed_outgoing',
  FAILED: 'FAILED',
  NOANSWER_TRANSFERED: 'notransfer_transfered',
  SENT: 'sent',
  RECEIVED: 'received',
  LEAD: 'lead',
  DEFAULT: 'default',
  UPDATE: 'update',
  ACCOUNT: 'account',
  PAUSE_FOR: 'pause_for',
  PAUSE_FOR_LEAD: 'pause_for_lead',
  FOR_ALL: 'for_all',
  NO_CADENCE_ACCESS: 'no_cadence_access',
  HAS_CADENCE_ACCESS: 'has_cadence_access',
  BULK: 'bulk',
};

const ACTIVITY_TEMPLATES = {
  [ACTIVITY_TYPE.CALL]: {
    [ACTIVITY_SUBTYPES.ANSWERED_WITH_INCALL_DURATION]: {
      name: 'You called {{lead_first_name}} {{lead_last_name}}',
      status: 'For {{incall_duration}} seconds',
    },
    [ACTIVITY_SUBTYPES.ANSWERED_WITH_INCALL_DURATION_INCOMING]: {
      name: 'You received a call from {{lead_first_name}} {{lead_last_name}}',
      status: 'For {{incall_duration}} seconds',
    },
    [ACTIVITY_SUBTYPES.ANSWERED_WITH_TOTAL_DURATION]: {
      name: 'You called {{lead_first_name}} {{lead_last_name}}',
      status: 'Call hung up after {{total_duration}} seconds',
    },
    [ACTIVITY_SUBTYPES.MISSED_INCOMING]: {
      name: 'You missed a call from {{lead_first_name}} {{lead_last_name}}',
      status: 'Missed call, rang for {{total_duration}} seconds',
    },
    [ACTIVITY_SUBTYPES.MISSED_OUTGOING]: {
      name: "{{lead_first_name}} {{lead_last_name}} didn't answer the call",
      status: 'Missed call, rang for {{total_duration}} seconds',
    },
    [ACTIVITY_SUBTYPES.NOANSWER_TRANSFERED]: {
      name: 'You rejected a call from {{lead_first_name}} {{lead_last_name}}',
      status: 'Call rang for {{total_duration}} seconds',
    },
    [ACTIVITY_SUBTYPES.FAILED]: {
      name: 'You called {{lead_first_name}} {{lead_last_name}}',
      status: 'Call failed',
    },
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'You called {{lead_first_name}} {{lead_last_name}}',
      status: 'For {{incall_duration}} seconds',
    },
  },
  [ACTIVITY_TYPE.CALLBACK]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Callback to {{lead_first_name}} {{lead_last_name}}',
      status: '',
    },
  },
  [ACTIVITY_TYPE.MESSAGE]: {
    [ACTIVITY_SUBTYPES.SENT]: {
      name: 'Message sent to {{lead_first_name}} {{lead_last_name}}.',
      status: '{{message}}',
    },
    [ACTIVITY_SUBTYPES.RECEIVED]: {
      name: 'Message recieved from {{lead_first_name}} {{lead_last_name}}.',
      status: '{{message}}',
    },
  },
  [ACTIVITY_TYPE.MAIL]: {
    [ACTIVITY_SUBTYPES.SENT]: {
      name: 'Sent email to {{lead_first_name}} {{lead_last_name}}',
      status: 'Subject: {{mail_subject}}',
    },
    [ACTIVITY_SUBTYPES.RECEIVED]: {
      name: 'Received email from {{lead_first_name}} {{lead_last_name}}',
      status: 'Subject: {{mail_subject}}',
    },
  },
  [ACTIVITY_TYPE.REPLY_TO]: {
    [ACTIVITY_SUBTYPES.SENT]: {
      name: 'Replied to {{lead_first_name}} {{lead_last_name}}',
      status: 'Subject: {{mail_subject}}',
    },
    [ACTIVITY_SUBTYPES.RECEIVED]: {
      name: 'Reply received from {{lead_first_name}} {{lead_last_name}}',
      status: 'Subject: {{mail_subject}}',
    },
  },
  [ACTIVITY_TYPE.LINKEDIN_CONNECTION]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'You have sent LinkedIn connection request to {{lead_first_name}} {{lead_last_name}}.',
      status: '{{message}}',
    },
  },
  [ACTIVITY_TYPE.LINKEDIN_INTERACT]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'You interacted with {{lead_first_name}} {{lead_last_name}} on LinkedIn.',
      status: '{{message}}',
    },
  },
  [ACTIVITY_TYPE.LINKEDIN_MESSAGE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'You have messaged {{lead_first_name}} {{lead_last_name}} on LinkedIn.',
      status: '{{message}}',
    },
  },
  [ACTIVITY_TYPE.LINKEDIN_PROFILE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'You have viewed LinkedIn profile of {{lead_first_name}} {{lead_last_name}}.',
      status: '{{message}}',
    },
  },
  [ACTIVITY_TYPE.WHATSAPP]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'You messaged {{lead_first_name}} {{lead_last_name}} on whatsapp',
      status: '{{message}}',
    },
  },
  [ACTIVITY_TYPE.EXPORTED_LEAD]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Exported Lead to {{crm}}',
      status:
        '{{lead_first_name}} {{lead_last_name}} is now a {{crm}} {{exported_as}}',
    },
  },
  [ACTIVITY_TYPE.NOTE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Note for {{lead_first_name}} {{lead_last_name}} by {{user}}',
      status: '{{note}}',
    },
    [ACTIVITY_SUBTYPES.UPDATE]: {
      name: 'Updated Note for ${lead_first_name} ${lead_last_name}',
      status: '{{note}}',
    },
  },
  [ACTIVITY_TYPE.MEETING]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Demo Booked',
      status:
        'You have booked a demo with {{lead_first_name}} at {{scheduled_at}}',
    },
  },
  [ACTIVITY_TYPE.CADENCE_CUSTOM]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Completed custom task',
      status: '',
    },
  },
  [ACTIVITY_TYPE.DATA_CHECK]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Completed data check',
      status: '',
    },
  },
  [ACTIVITY_TYPE.LAUNCH_CADENCE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: '{{cadence_name}} Launched',
      status: 'Cadence Launched by {{user}} at {{launch_at}}',
    },
  },
  [ACTIVITY_TYPE.PAUSE_CADENCE]: {
    [ACTIVITY_SUBTYPES.PAUSE_FOR]: {
      name: '{{cadence_name}} has been paused',
      status: 'Cadence Paused {{by_user}} till {{pause_for}}',
    },
    [ACTIVITY_SUBTYPES.PAUSE_FOR_LEAD]: {
      name: 'Paused {{cadence_name}} for this lead',
      status: 'Cadence Paused {{by_user}} till {{pause_for}}',
    },
    [ACTIVITY_SUBTYPES.LEAD]: {
      name: 'Paused {{cadence_name}} for this lead',
      status: 'Cadence Paused {{by_user}}',
    },
    [ACTIVITY_SUBTYPES.BULK]: {
      name: 'All cadences paused',
      status: 'Cadences were paused with bulk pause',
    },
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: '{{cadence_name}} has been paused',
      status: 'Cadence Paused {{by_user}}',
    },
  },
  [ACTIVITY_TYPE.RESUME_CADENCE]: {
    [ACTIVITY_SUBTYPES.LEAD]: {
      name: '{{cadence_name}} resumed for this lead',
      status: 'Cadence Resumed',
    },
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: '{{cadence_name}} resumed',
      status: 'Cadence Resumed',
    },
  },
  [ACTIVITY_TYPE.STOP_CADENCE]: {
    [ACTIVITY_SUBTYPES.LEAD]: {
      name: 'Stopped {{cadence_name}} for this lead',
      status: '{{cadence_name}} has been stopped {{by_user}}',
    },
    [ACTIVITY_SUBTYPES.FOR_ALL]: {
      name: 'Stopped all cadences for this lead',
      status: 'All cadences have been stopped {{by_user}}',
    },
    [ACTIVITY_SUBTYPES.BULK]: {
      name: 'All cadences stopped',
      status: 'Cadences were stopped with bulk stop',
    },
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Stopped {{cadence_name}} for this lead',
      status: '{{cadence_name}} has been stopped {{by_user}}',
    },
  },
  [ACTIVITY_TYPE.COMPLETED_CADENCE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Cadence has been completed',
      status: '{{cadence_name}} has been completed',
    },
  },
  [ACTIVITY_TYPE.MOVE_CADENCE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'This person has been moved to {{cadence_name}} cadence',
      status: 'Moved to a cadence',
    },
  },
  [ACTIVITY_TYPE.UNSUBSCRIBE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: '{{lead_first_name}} {{lead_last_name}} has unsubscribed',
      status: 'The lead has unsubscribed from {{cadence_name}}',
    },
  },
  [ACTIVITY_TYPE.TASK_SKIPPED]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'User has skipped task',
      status: '{{task_name}} has been manually skipped',
    },
  },
  [ACTIVITY_TYPE.LEAD_DELETE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'The contact has gotten deleted from salesforce',
      status: 'Contact has been trashed and all cadences stopped',
    },
  },
  [ACTIVITY_TYPE.OWNER_CHANGED_TEAM]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'The user is moved to a new group',
      status: 'The user group is changed and all lead and contacts are updated',
    },
  },
  [ACTIVITY_TYPE.LEAD_DISQUALIFIED]: {
    [ACTIVITY_SUBTYPES.ACCOUNT]: {
      name: 'Account status is changed to FAKE',
      status: 'Account disqualified and all cadences stopped.',
    },
    [ACTIVITY_SUBTYPES.LEAD]: {
      name: 'Lead is disqualified in Salesforce',
      status: 'Lead disqualified and all cadences stopped.',
    },

    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Disqualify Lead',
      status: 'Lead disqualified on {{today}}',
    },
  },
  [ACTIVITY_TYPE.LEAD_CONVERTED]: {
    [ACTIVITY_SUBTYPES.ACCOUNT]: {
      name: 'Account status changed to INTERESTED',
      status: 'Account interested and all cadences stopped.',
    },
    [ACTIVITY_SUBTYPES.LEAD]: {
      name: 'Lead is converted from Salesforce',
      status: 'Lead converted and all cadences stopped.',
    },
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Convert Lead',
      status: 'Lead converted on {{today}}',
    },
  },
  [ACTIVITY_TYPE.CLICKED_MAIL]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: '{{lead_first_name}} {{lead_last_name}} has clicked the mail',
      status: 'The lead has clicked the mail.',
    },
  },
  [ACTIVITY_TYPE.CLICKED_MESSAGE]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: '{{lead_first_name}} {{lead_last_name}} has clicked the message',
      status: 'The lead has clicked the message.',
    },
  },
  [ACTIVITY_TYPE.VIEWED_MAIL]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: '{{lead_first_name}} {{lead_last_name}} has opened the mail',
      status: 'The lead has opened the mail.',
    },
  },
  [ACTIVITY_TYPE.BOUNCED_MAIL]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Email sent to {{lead_first_name}} {{lead_last_name}} has bounced.',
      status: 'The Email has bounced.',
    },
  },
  [ACTIVITY_TYPE.OWNER_CHANGE]: {
    [ACTIVITY_SUBTYPES.NO_CADENCE_ACCESS]: {
      name: 'Owner changed in {{crm}} and cadence has stopped',
      status: 'New owner does not have access to the old cadences',
    },
    [ACTIVITY_SUBTYPES.HAS_CADENCE_ACCESS]: {
      name: 'Owner changed in {{crm}} and all tasks are updated',
      status: 'Owner changed and tasks have been shifted.',
    },
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Owner changed in {{crm}}.',
      status: 'Owner changed and all cadences stopped.',
    },
  },
  [ACTIVITY_TYPE.CUSTOM_TASK]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Custom task : {{custom_task_name}}',
      status: 'Custom task for {{custom_task_name}} is created.',
    },
  },
  [ACTIVITY_TYPE.HOT_LEAD]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'Hot Lead',
      status: '{{lead_first_name}} {{lead_last_name}} is now a hot lead',
    },
  },
  [ACTIVITY_TYPE.UNLINKED_LEAD]: {
    [ACTIVITY_SUBTYPES.DEFAULT]: {
      name: 'This person has been removed from all cadences',
      status:
        'User group was changed so all leads and contacts have been removed from all cadences',
    },
  },
};

const NOTIFICATION_TYPES = {
  BOUNCED: 'bounced',
  UNSUBSCRIBED: 'unsubscribed',
  MISSED_CALL: 'missed',
  MESSAGE: 'message',
  SUPPORT: 'support',
  VIEWED_MAIL: 'viewed_mail',
  CLICKED_MAIL: 'clicked_mail',
  HOT_LEAD: 'hot_lead',
  REMINDER: 'reminder',
};

const NOTIFICATION_SUBTYPES = {
  MISSED_INCOMING: 'missed_incoming',
  MISSED_OUTGOING: 'missed_outgoing',
  DEFAULT: 'default',
};

const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.BOUNCED]: {
    [NOTIFICATION_SUBTYPES.DEFAULT]: {
      title: 'Mail bounced',
    },
  },
  [NOTIFICATION_TYPES.UNSUBSCRIBED]: {
    [NOTIFICATION_SUBTYPES.DEFAULT]: {
      title: '{{lead_first_name}} {{lead_last_name}} has unsubscribed',
    },
  },
  [NOTIFICATION_TYPES.VIEWED_MAIL]: {
    [NOTIFICATION_SUBTYPES.DEFAULT]: {
      title: 'Mail opened',
    },
  },
  [NOTIFICATION_TYPES.CLICKED_MAIL]: {
    [NOTIFICATION_SUBTYPES.DEFAULT]: {
      title: 'Link clicked',
    },
  },
  [NOTIFICATION_TYPES.MISSED_CALL]: {
    [NOTIFICATION_SUBTYPES.MISSED_INCOMING]: {
      title: 'You missed a call from {{lead_first_name}} {{lead_last_name}}',
    },
    [NOTIFICATION_SUBTYPES.MISSED_OUTGOING]: {
      title: "{{lead_first_name}} {{lead_last_name}} didn't answer the call",
    },
  },
  [NOTIFICATION_TYPES.MESSAGE]: {
    [NOTIFICATION_SUBTYPES.DEFAULT]: {
      title: 'Message recieved from {{lead_first_name}} {{lead_last_name}}.',
    },
  },
  [NOTIFICATION_TYPES.SUPPORT]: {
    [NOTIFICATION_SUBTYPES.DEFAULT]: {
      title: 'Message recieved from support : {{message}}.',
    },
  },
  [NOTIFICATION_TYPES.HOT_LEAD]: {
    [NOTIFICATION_SUBTYPES.DEFAULT]: {
      title: 'Hot Lead',
    },
  },
  [NOTIFICATION_TYPES.REMINDER]: {
    [NOTIFICATION_SUBTYPES.DEFAULT]: {
      title:
        '{{custom_task_name}} with {{lead_first_name}} {{lead_last_name}} in {{reminder_time}} mins',
    },
  },
};

const TEMPLATE_ID_MAP = {
  [TEMPLATE_TYPE.EMAIL]: 'et_id',
  [TEMPLATE_TYPE.LINKEDIN]: 'lt_id',
  [TEMPLATE_TYPE.WHATSAPP]: 'wt_id',
  [TEMPLATE_TYPE.SCRIPT]: 'st_id',
  [TEMPLATE_TYPE.SMS]: 'mt_id',
  [TEMPLATE_TYPE.VIDEO]: 'vt_id',
};

const TEMPLATE_LABELS = {
  [TEMPLATE_TYPE.EMAIL]: 'Email',
  [TEMPLATE_TYPE.LINKEDIN]: 'Linkedin',
  [TEMPLATE_TYPE.WHATSAPP]: 'Whatsapp',
  [TEMPLATE_TYPE.SCRIPT]: 'Script',
  [TEMPLATE_TYPE.SMS]: 'SMS',
  [TEMPLATE_TYPE.VIDEO]: 'Video',
};

//mail auto response headers
const MAIL_AUTO_RESPONSE_HEADERS = {
  AUTO_SUBMITTED: 'auto-submitted',
  X_AUTO_RESPONSE_SUPPRESS: 'x-auto-response-suppress',
  X_AUTO_REPLY: 'x-auto-reply',
  PRECEDENCE: 'precedence',
};

//mail auto response header values
const MAIL_AUTO_RESPONSE_HEADER_VALUES = {
  AUTO_SUBMITTED: 'auto-generated',
  X_AUTO_RESPONSE_SUPPRESS: 'All',
  X_AUTO_REPLY: 'yes',
  PRECEDENCE: 'bulk',
};

const CHATBOT_THREAD_STATUS = {
  COMPLETE: 'complete',
  PENDING: 'pending',
};

const CHATBOT_TOKEN_TYPES = {
  USER: 'user',
  CHATBOT: 'chatbot',
};

const ACTIVE_CADENCE_FILTER = {
  PERSONAL: 'personal',
  TEAM: 'team',
  COMPANY: 'company',
  ALL: 'all',
};
const CALENDAR_TIMEFRAME = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

const CALENDAR_OFFSET = {
  START: 'start',
  END: 'end',
  PIVOT: 'pivot',
};

const GSHEETS_LEAD_STATUS = {
  USER_NOT_PRESENT: 'user_not_present',
  LEAD_PRESENT_IN_TOOL: 'lead_present_in_tool',
  LEAD_ABSENT_IN_TOOL: 'lead_absent_in_tool',
  USER_NOT_PART_OF_CADENCE: 'user_not_part_of_cadence',
};

const EXCEL_LEAD_STATUS = {
  USER_NOT_PRESENT: 'user_not_present',
  LEAD_PRESENT_IN_TOOL: 'lead_present_in_tool',
  LEAD_ABSENT_IN_TOOL: 'lead_absent_in_tool',
  USER_NOT_PART_OF_CADENCE: 'user_not_part_of_cadence',
};

const CRM_INTEGRATIONS = {
  SALESFORCE: 'salesforce',
  PIPEDRIVE: 'pipedrive',
  GOOGLE_SHEETS: 'google_sheets',
  EXCEL: 'excel',
  HUBSPOT: 'hubspot',
  ZOHO: 'zoho',
  SELLSY: 'sellsy',
  DYNAMICS: 'dynamics',
  BULLHORN: 'bullhorn',
  SHEETS: 'sheets',
};
const HIRING_INTEGRATIONS = {
  BULLHORN: 'bullhorn',
};
const INTEGRATIONS_TYPE = {
  CRM: 'crm',
  HIRING: 'hiring',
};

const PIPEDRIVE_ENDPOINTS = {
  PERSON: 'person',
  USER: 'user',
  ORGANIZATION: 'organization',
  DEAL: 'deal',
};

const HUBSPOT_ENDPOINTS = {
  CONTACT: 'contact',
  COMPANY: 'company',
  USER: 'user',
};

const SELLSY_ENDPOINTS = {
  CONTACT: 'contact',
  COMPANY: 'company',
  USER: 'user',
};

const LEAD_INTEGRATION_TYPES = {
  SALESFORCE_LEAD: 'salesforce_lead',
  SALESFORCE_CONTACT: 'salesforce_contact',
  SALESFORCE_GOOGLE_SHEET_LEAD: 'salesforce_google_sheet_lead',
  SALESFORCE_CSV_LEAD: 'salesforce_csv_lead',
  PIPEDRIVE_PERSON: 'pipedrive_person',
  PIPEDRIVE_GOOGLE_SHEET_PERSON: 'pipedrive_google_sheet_person',
  PIPEDRIVE_CSV_PERSON: 'pipedrive_csv_person',
  GOOGLE_SHEETS_LEAD: 'google_sheets_lead',
  EXCEL_LEAD: 'excel_lead',
  HUBSPOT_CONTACT: 'hubspot_contact',
  HUBSPOT_GOOGLE_SHEET_CONTACT: 'hubspot_google_sheet_contact',
  HUBSPOT_CSV_CONTACT: 'hubspot_csv_contact',
  ZOHO_LEAD: 'zoho_lead',
  ZOHO_CONTACT: 'zoho_contact',
  ZOHO_CSV_LEAD: 'zoho_csv_lead',
  ZOHO_GOOGLE_SHEET_LEAD: 'zoho_google_sheet_lead',
  SELLSY_CONTACT: 'sellsy_contact',
  SELLSY_CSV_CONTACT: 'sellsy_csv_contact',
  SELLSY_GOOGLE_SHEET_CONTACT: 'sellsy_google_sheet_contact',
  BULLHORN_CONTACT: 'bullhorn_contact',
  BULLHORN_CANDIDATE: 'bullhorn_candidate',
  BULLHORN_LEAD: 'bullhorn_lead',
  BULLHORN_CSV_LEAD: 'bullhorn_csv_lead',
  BULLHORN_GOOGLE_SHEET_LEAD: 'bullhorn_google_sheet_lead',
  DYNAMICS_CONTACT: 'dynamics_contact',
  DYNAMICS_LEAD: 'dynamics_lead',
  PRODUCT_TOUR_EXCEL_LEAD: 'product_tour_excel_lead',
};

const ACCOUNT_INTEGRATION_TYPES = {
  SALESFORCE_ACCOUNT: 'salesforce_account',
  SALESFORCE_LEAD_ACCOUNT: 'salesforce_lead_account',
  SALESFORCE_GOOGLE_SHEET_ACCOUNT: 'salesforce_google_sheet_account',
  SALESFORCE_CSV_ACCOUNT: 'salesforce_csv_account',
  PIPEDRIVE_ORGANIZATION: 'pipedrive_organization',
  PIPEDRIVE_GOOGLE_SHEET_ORGANIZATION: 'pipedrive_google_sheet_organization',
  PIPEDRIVE_CSV_ORGANIZATION: 'pipedrive_csv_organization',
  GOOGLE_SHEETS_ACCOUNT: 'google_sheets_acount',
  EXCEL_ACCOUNT: 'excel_acount',
  HUBSPOT_COMPANY: 'hubspot_company',
  HUBSPOT_GOOGLE_SHEET_COMPANY: 'hubspot_google_sheet_company',
  HUBSPOT_CSV_COMPANY: 'hubspot_csv_company',
  SELLSY_COMPANY: 'sellsy_company',
  SELLSY_CSV_COMPANY: 'sellsy_csv_company',
  SELLSY_GOOGLE_SHEET_COMPANY: 'sellsy_google_sheet_company',
  ZOHO_ACCOUNT: 'zoho_account',
  ZOHO_LEAD_ACCOUNT: 'zoho_lead_account',
  ZOHO_CSV_ACCOUNT: 'zoho_csv_account',
  ZOHO_GOOGLE_SHEET_ACCOUNT: 'zoho_google_sheet_account',
  BULLHORN_ACCOUNT: 'bullhorn_account',
  BULLHORN_CSV_ACCOUNT: 'bullhorn_csv_account',
  BULLHORN_GOOGLE_SHEET_ACCOUNT: 'bullhorn_google_sheet_account',
  BULLHORN_LEAD_ACCOUNT: 'bullhorn_lead_account',
  BULLHORN_CANDIDATE_ACCOUNT: 'bullhorn_candidate_account',
  DYNAMICS_ACCOUNT: 'dynamics_account',
  DYNAMICS_LEAD_ACCOUNT: 'dynamics_lead_account',
  PRODUCT_TOUR_EXCEL_ACCOUNT: 'product_tour_excel_account',
};

const USER_INTEGRATION_TYPES = {
  SALESFORCE_OWNER: 'salesforce_owner',
  PIPEDRIVE_USER: 'pipedrive_user',
  GOOGLE_SHEETS_USER: 'google_sheets_user',
  SHEETS_USER: 'sheets_user',
  EXCEL_USER: 'excel_user',
  HUBSPOT_OWNER: 'hubspot_owner',
  ZOHO_USER: 'zoho_user',
  SELLSY_OWNER: 'sellsy_owner',
  BULLHORN_USER: 'bullhorn_user',
  DYNAMICS_OWNER: 'dynamics_owner',
};

const FIELD_MAP_MODEL_NAMES = {
  SALESFORCE: 'Salesforce_Field_Map',
  PIPEDRIVE: 'Pipedrive_Field_Map',
  GOOGLE_SHEETS: 'Google_Sheets_Field_Map',
  EXCEL: 'Excel_Field_Map',
  HUBSPOT: 'Hubspot_Field_Map',
  ZOHO: 'Zoho_Field_Map',
  SELLSY: 'Sellsy_Field_Map',
  BULLHORN: 'Bullhorn_Field_Map',
  DYNAMICS: 'Dynamics_Field_Map',
};

const EXTENSION_FIELD_MAP_MODEL_NAMES = {
  SALESFORCE: 'EFM_Salesforce',
  PIPEDRIVE: 'EFM_Pipedrive',
  HUBSPOT: 'EFM_Hubspot',
  GOOGLE_SHEETS: 'EFM_GoogleSheet',
  SELLSY: 'EFM_Sellsy',
  EXCEL: 'EFM_Excel',
  ZOHO: 'EFM_Zoho',
  BULLHORN: 'EFM_Bullhorn',
  DYNAMICS: 'EFM_Dynamic',
};

const PIPEDRIVE_ACTIVITY_TYPES = {
  CALL: 'call',
  MEETING: 'meeting',
  TASK: 'task',
  DEADLINE: 'deadline',
  EMAIL: 'email',
  LUNCH: 'lunch',
  NOTE: 'note',
  MESSAGE: 'Message',
  LUNCH: 'lunch',
  DEADLINE: 'deadline',
};

const PIPEDRIVE_VIEW_TYPES = {
  LIST: 'list',
  DETAILS: 'details',
  CUSTOM_VIEW: 'custom_view',
};

const BULK_OPTIONS = {
  SELECTED: 'selected',
  ALL: 'all',
};

const MAIL_INTEGRATION_TYPES = {
  OUTLOOK: 'outlook',
  GOOGLE: 'google',
};

const PHONE_SYSTEM_TYPE = {
  NONE: 'none',
  DEFAULT: 'ringover',
  CUSTOM: 'tbd',
};
const IMAGE_FORMATS = {
  JPG: 'jpg',
  PNG: 'png',
  GIF: 'gif',
  SVG: 'svg',
  WEBP: 'webp',
  JPEG: 'jpeg',
};

const VIDEO_FORMAT = {
  MP4: 'mp4',
  MPEG: 'mpeg',
  MKV: 'mkv',
  WEBM: 'webm',
};

const AUDIO_FORMAT = {
  MP3: 'mp3',
  MPEG: 'mpeg',
  WAV: 'wav',
  OGG: 'ogg',
};

const ATTACHMENT_FORMATS = {
  ...IMAGE_FORMATS,
  ...VIDEO_FORMAT,
  ...AUDIO_FORMAT,
  DOC: 'doc',
  DOCX: 'docx',
  XLS: 'xls',
  XLSX: 'xlsx',
  PPT: 'ppt',
  PPTX: 'pptx',
  XPS: 'xps',
  PDF: 'pdf',
  DXF: 'dxf',
  AI: 'ai',
  PSD: 'psd',
  EPS: 'eps',
  PS: 'ps',
  SVG: 'svg',
  TTF: 'ttf',
  ZIP: 'zip',
  RAR: 'rar',
  TAR: 'tar',
  GZIP: 'gzip',
  TXT: 'txt',
  CSV: 'csv',
};

const TEMPLATE_STATS_TYPE = {
  CLICKED: 'clicked',
  BOUNCED: 'bounced',
  REPLIED: 'replied',
  VIEWED: 'viewed',
  UNSUBSCRIBED: 'unsubscribed',
};

const CADENCE_STEPS_STATS_TYPE = {
  DONE: 'done',
  SKIPPED: 'skipped',
  SCHEDULED: 'scheduled',
  CURRENT: 'current',
  DISQUALIFIED: 'trash',
  CONVERTED: 'converted',
  PAUSED: 'paused',
};

const COMPARE_CADENCE_KPI_TYPE = {
  TOTAL_TASKS: 'total_tasks',
  DONE_TASKS: 'done_tasks',
  SKIPPED_TASKS: 'skipped_tasks',
  CALLS: 'calls',
  EMAILS: 'emails',
  SMS: 'sms',
  LINKEDIN: 'linkedin',
  CUSTOM_TASK: 'custom_task',
  DATA_CHECK: 'data_check',
  WHATSAPP: 'whatsapp',
  CALLBACK: 'callback',
  AVERAGE_TIME: 'average_time',
  TOTAL_LEADS: 'total_leads',
  ACTIVE_LEADS: 'active_leads',
  LEADS_LEFT_IN_CADENCE: 'leads_left_in_cadence',
  DISQUALIFIED_LEADS: 'disqualified_leads',
  CONVERTED_LEADS: 'converted_leads',
  DEMOS_BOOKED: 'demos_booked',
};

const COMPARE_CADENCE_VALUE_TYPE = {
  ABSOLUTE_VALUES: 'absolute_values',
  PERCENTAGE_VALUES: 'percentage_values',
};

const COMPARE_CADENCE_PERCENTAGE_TYPE = {
  TOTAL_TASKS: 'total_tasks',
  NODE_TASKS: 'node_tasks',
};

const COMPARE_CADENCE_COMPARISION_TYPE = {
  VALUE_OVER_TIME: 'value_over_time',
  TOTAL_VALUE: 'total_value',
};

const STATISTICS_DATE_COLUMN_TYPE = {
  TIMESTAMP: 'timestamp',
  DATETIME: 'datetime',
};

const STATISTICS_TABLE_GROUP_BY_TYPE = {
  USERS: 'users',
  CADENCE: 'cadence',
};

const TASK_NAMES_BY_TYPE = {
  [NODE_TYPES.CALL]: 1,
  [NODE_TYPES.MESSAGE]: 2,
  [NODE_TYPES.MAIL]: 3,
  [NODE_TYPES.LINKEDIN_CONNECTION]: 4,
  [NODE_TYPES.LINKEDIN_MESSAGE]: 5,
  [NODE_TYPES.LINKEDIN_PROFILE]: 6,
  [NODE_TYPES.LINKEDIN_INTERACT]: 7,
  [NODE_TYPES.DATA_CHECK]: 8,
  [NODE_TYPES.CADENCE_CUSTOM]: 9,
  [NODE_TYPES.REPLY_TO]: 10,
  [NODE_TYPES.AUTOMATED_MAIL]: 11,
  [NODE_TYPES.AUTOMATED_MESSAGE]: 12,
  [NODE_TYPES.DONE_TASKS]: 13,
  [NODE_TYPES.END]: 14,
  [NODE_TYPES.AUTOMATED_REPLY_TO]: 15,
  [NODE_TYPES.WHATSAPP]: 16,
  [NODE_TYPES.CALLBACK]: 17,
  [NODE_TYPES.OTHER]: 18,
  [NODE_TYPES.AUTOMATED_LINKEDIN_CONNECTION]: 19,
  [NODE_TYPES.AUTOMATED_LINKEDIN_MESSAGE]: 20,
  [NODE_TYPES.AUTOMATED_LINKEDIN_PROFILE]: 21,
};

const WEBHOOK_TYPE = {
  DISQUALIFY: 'disqualify',
  CONVERT: 'convert',
  CUSTOM: 'custom',
};

const HTTP_METHOD = {
  POST: 'post',
};

const TASK_NAME_FOR_DISPLAY = {
  [TASK_NAMES_BY_TYPE[NODE_TYPES.MAIL]]: 'Semi Automated Mail',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.AUTOMATED_MAIL]]: 'Automated Mail',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.REPLY_TO]]: 'Reply to',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.MESSAGE]]: 'Semi Automated Message',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.AUTOMATED_MESSAGE]]: 'Automated Message',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.CALL]]: 'Call',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.CALLBACK]]: 'Callback',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_CONNECTION]]:
    'Linkedin Connection Request',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_MESSAGE]]: 'Linkedin Message',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_PROFILE]]: 'Linkedin View Profile',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_INTERACT]]:
    'Linkedin Interact with Post',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.DATA_CHECK]]: 'Data Check',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.CADENCE_CUSTOM]]: 'Cadence Custom',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.END]]: 'End Cadence',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.AUTOMATED_REPLY_TO]]: 'Automated Reply to',
  [TASK_NAMES_BY_TYPE[NODE_TYPES.WHATSAPP]]: 'Whatsapp',
};

const AUTOMATED_WORKFLOW_TRIGGERS = {
  WHEN_A_LEAD_IS_ADDED_TO_ORG: 'when_a_lead_is_added_to_org',
  WHEN_A_LEAD_IS_UPDATED: 'when_a_lead_is_updated',
  WHEN_A_CONTACT_IS_UPDATED: 'when_a_contact_is_updated',
  WHEN_A_CONTACT_IS_ADDED_TO_ORG: 'when_a_contact_is_added_to_org',
  WHEN_A_CANDIDATE_IS_ADDED_TO_ORG: 'when_a_candidate_is_added_to_org',
  WHEN_A_CANDIDATE_IS_UPDATED: 'when_a_candidate_is_updated',
};

const AUTOMATED_WORKFLOW_ACTIONS = {
  ADD_TO_CADENCE: 'add_to_cadence',
  UPDATE_STATUS: 'update_status',
};

const AUTOMATED_WORKFLOW_FILTER_OPERATION = {
  AND: 'and',
  OR: 'or',
  CONDITION: 'condition',
};

// === DEPRECATED | NOT IN USE (02/02/2023) ===
const AUTOMATED_WORKFLOW_FILTER_TYPES = {
  USER_FIRST_NAME: 'user_first_name',
  USER_LAST_NAME: 'user_last_name',
  USER_INTEGRATION_ID: 'user_integration_id',
  LEAD_STATUS: 'lead_status',
  ACCOUNT_STATUS: 'account_status',
  LEAD_CREATION_DATE: 'lead_creation_date',
  ACCOUNT_CREATION_DATE: 'account_creation_date',
};

// * Supported field data types
const AUTOMATED_WORKFLOW_DATA_TYPES = {
  STRING: 'string',
  DATE: 'date',
};

// * Model types
const MODEL_TYPES = {
  LEAD: 'lead',
  CONTACT: 'contact',
  USER: 'user',
  ACCOUNT: 'account',
  CANDIDATE: 'candidate',
};

const AUTOMATED_WORKFLOW_FILTER_EQUATORS = {
  EQUAL: 'equal',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  INCLUDES: 'includes',
};

const CSV_LEADS_FIELD_MAP = {
  Id: 'Lead ID',
  first_name: 'First Name',
  last_name: 'Last Name',
  linkedin_url: 'LinkedIn URL',
  job_position: 'Job Position',
  salesforce_owner_id: 'Salesforce Owner ID',
  company_name: 'Company Name',
  company_id: 'Company Integration ID',
  size: 'Company Size',
  url: 'URL',
  country: 'Country',
  zipcode: 'Zipcode',
};

const SALESFORCE_CSV_IMPORT_FIELDS = {
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  LINKEDIN_URL: 'Linkedin URL',
  JOB_POSITION: 'Job Position',
  COMPANY: 'Company Name',
  COMPANY_PHONE_NUMBER: 'Company Phone',
  URL: 'Company Website',
  COUNTRY: 'Country',
  SIZE: 'Company Size',
  ZIP_CODE: 'Zipcode',
  SALESFORCE_OWNER_ID: 'Salesforce Owner ID',
};

const SALESFORCE_PHONE_FIELDS = [
  'Primary Phone Number',
  'Mobile Phone',
  'Other Phone 1',
  'Other Phone 2',
];

const SALESFORCE_EMAIL_FIELDS = [
  'Primary Email',
  'Alternate Email 1',
  'Alternate Email 2',
  'Alternate Email 3',
  'Alternate Email 4',
];

const PIPEDRIVE_CSV_IMPORT_FIELDS = {
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  LINKEDIN_URL: 'Linkedin URL',
  JOB_POSITION: 'Job Position',
  COMPANY_NAME: 'Company Name',
  COMPANY_PHONE_NUMBER: 'Company Phone Number',
  COMPANY_LINKEDIN_URL: 'Company Linkedin URL',
  URL: 'Company Website',
  COUNTRY: 'Country',
  SIZE: 'Size',
  ZIP_CODE: 'Zipcode',
  EMAILS: 'Primary Email',
  PHONE_NUMBERS: 'Primary Phone Number',
  PIPEDRIVE_OWNER_ID: 'Pipedrive Owner ID',
};

const HUBSPOT_CSV_IMPORT_FIELDS = {
  RECORD_ID: 'Record ID',
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  LINKEDIN_URL: 'Linkedin URL',
  JOB_POSITION: 'Job Position',
  MOBILE_PHONE_NUMBER: 'Mobile Phone Number',
  WORK_EMAIL: 'Work email',
  PHONE_NUMBER: 'Phone Number',
  COMPANY_PHONE_NUMBER: 'Company Phone Number',
  COMPANY_LINKEDIN_URL: 'Company Linkedin URL',
  CONTACT_OWNER: 'Contact owner',
  STATE: 'State/Region',
  COUNTRY: 'Country/Region',
  WEBSITE_URL: 'Website URL',
  JOB_TITLE: 'Job Title',
  EMAIL: 'Email',
  SIZE: 'Size',
  INTEGRATION_STATUS: 'Integration status',
  ZIP_CODE: 'Zipcode',
  COMPANY_NAME: 'Associated Company',
  ASSOCIATED_COMPANY_ID: 'Associated Company IDs',
};

const HUBSPOT_CSV_GS_IMPORT_FIELDS = {
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  LINKEDIN_URL: 'Linkedin URL',
  JOB_POSITION: 'Job Position',
  COMPANY_NAME: 'Company Name',
  COMPANY_PHONE_NUMBER: 'Company Phone Number',
  COMPANY_LINKEDIN_URL: 'Company Linkedin URL',
  URL: 'Company Website',
  COUNTRY: 'Country',
  SIZE: 'Size',
  ZIP_CODE: 'Zipcode',
  EMAILS: 'Primary Email',
  PHONE_NUMBERS: 'Primary Phone Number',
  HUBSPOT_OWNER_ID: 'Hubspot Owner ID',
};

const ZOHO_CSV_IMPORT_FIELDS = {
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  LINKEDIN_URL: 'Linkedin URL',
  JOB_POSITION: 'Job Position',
  COMPANY_NAME: 'Company Name',
  URL: 'Company Website',
  COUNTRY: 'Country',
  SIZE: 'Company Size',
  ZIP_CODE: 'Zipcode',
  ZOHO_OWNER_ID: 'Zoho Owner ID',
};

const SELLSY_CSV_IMPORT_FIELDS = {
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  LINKEDIN_URL: 'Linkedin URL',
  JOB_POSITION: 'Job Position',
  COMPANY_NAME: 'Company Name',
  COMPANY_PHONE_NUMBER: 'Company Phone Number',
  URL: 'Company Website',
  COUNTRY: 'Country',
  SIZE: 'Company Size',
  ZIP_CODE: 'Zipcode',
  SELLSY_OWNER_ID: 'Sellsy Owner ID',
};

const BULLHORN_CSV_IMPORT_FIELDS = {
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  LINKEDIN_URL: 'Linkedin URL',
  JOB_POSITION: 'Job Position',
  COMPANY_NAME: 'Company Name',
  COMPANY_PHONE_NUMBER: 'Company Phone',
  URL: 'Company Website',
  COUNTRY: 'Country',
  SIZE: 'Company Size',
  ZIP_CODE: 'Zipcode',
  BULLHORN_OWNER_ID: 'Bullhorn Owner ID',
};

const CUSTOM_VARIABLE_TYPES = {
  LEAD: 'lead',
  CONTACT: 'contact',
  ACCOUNT: 'account',
  PERSON: 'person',
  ORGANIZATION: 'organization',
  COMPANY: 'company',
  CANDIDATE: 'candidate',
};

const ZOHO_ENDPOINTS = {
  LEAD: 'lead',
  ACCOUNT: 'account',
  CONTACT: 'contact',
  USER: 'user',
};
const BULLHORN_ENDPOINTS = {
  LEAD: 'lead',
  CORPORATION: 'clientCorporation',
  CONTACT: 'clientContact',
  CANDIDATE: 'candidate',
  USER: 'corporateUser',
};

let EXIT_SIGNALS = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

const DARK_AVATAR_BACKGROUND_COLORS = [
  {
    zero: '#F75A92',
    one: '#FF9A9A',
  },
  {
    zero: '#FFCF4F',
    one: '#FF9B4A',
  },
  {
    zero: '#72BBF1',
    one: '#4B90E2',
  },
  {
    zero: '#8496AB',
    one: '#567191',
  },
  {
    zero: '#40E0CF',
    one: '#36CDCF',
  },
  {
    zero: '#037DFC',
    one: '#8AC3FF',
  },
  {
    zero: '#5B6BE1',
    one: '#7A89FA',
  },
];

const ZOHO_DATA_IMPORT_TYPES = {
  CONTACT: 'contact',
  LEAD: 'lead',
};
const BULLHORN_DATA_IMPORT_TYPES = {
  CONTACT: 'contact',
  LEAD: 'lead',
  CANDIDATE: 'candidate',
};

const IMPORT_OPTIONS = {
  CRM_ONLY: 'crm_only',
  CRM_AND_CADENCE: 'crm_and_cadence',
};

const WEBHOOK_ACTIVITY_TYPES = {
  COMPANY_ADDED: 'Company Added',
};

const FALLBACK_VARIABLES = {
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  FULL_NAME: 'full_name',
  EMAIL: 'email',
  PHONE: 'phone',
  OWNER: 'owner',
  LINKEDIN_URL: 'linkedin_url',
  OCCUPATION: 'job_position',
  COMPANY_LINKEDIN_URL: 'company_linkedin_url',
  WEBSITE: 'website',
  SIZE: 'size',
  ZIPCODE: 'zipcode',
  COUNTRY: 'country',
  COMPANY_NAME: 'company_name',
  COMPANY_PHONE_NUMBER: 'company_phone_number',
  SENDER_FIRST_NAME: 'sender_first_name',
  SENDER_LAST_NAME: 'sender_last_name',
  SENDER_NAME: 'sender_name',
  SENDER_EMAIL: 'sender_email',
  SENDER_PHONE_NUMBER: 'sender_phone_number',
  SENDER_COMPANY: 'sender_company',
};

const TRANSLATED_DAYS = {
  EN_WEEKDAY: [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ],
  FR_WEEKDAY: [
    'dimanche',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
  ],
  ES_WEEKDAY: [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ],
  EN_WEEKDAY_CAPITAL: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  FR_WEEKDAY_CAPITAL: [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ],
  ES_WEEKDAY_CAPITAL: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
  ENGLISH: 'en',
  FRENCH: 'fr',
  SPANISH: 'es',
  ENGLISH_CAPITAL: 'en_capital',
  FRENCH_CAPITAL: 'fr_capital',
  SPANISH_CAPITAL: 'es_capital',
};

const LEAD_INTEGRATION_TYPES_LABELS = {
  [LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD]: 'Salesforce Lead',
  [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT]: 'Salesforce Contact',
  [LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON]: 'Pipedrive Person',
  [LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD]: 'Google sheets Lead',
  [LEAD_INTEGRATION_TYPES.EXCEL_LEAD]: 'Excel Lead',
  [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT]: 'Hubspot Contact',
  [LEAD_INTEGRATION_TYPES.ZOHO_LEAD]: 'Zoho Lead',
  [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: 'Zoho Contact',
  [LEAD_INTEGRATION_TYPES.SELLSY_CONTACT]: 'Sellsy Contact',
};

const LEAD_INTEGRATION_TYPES_DROPDOWN = {
  [CRM_INTEGRATIONS.SALESFORCE]: [
    {
      value: LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD,
      label:
        LEAD_INTEGRATION_TYPES_LABELS[LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD],
    },
    {
      value: LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT,
      label:
        LEAD_INTEGRATION_TYPES_LABELS[
          LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT
        ],
    },
  ],
  [CRM_INTEGRATIONS.PIPEDRIVE]: [
    {
      value: LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON,
      label:
        LEAD_INTEGRATION_TYPES_LABELS[LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON],
    },
  ],
  [CRM_INTEGRATIONS.GOOGLE_SHEETS]: [
    {
      value: LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD,
      label:
        LEAD_INTEGRATION_TYPES_LABELS[
          LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD
        ],
    },
  ],
  [CRM_INTEGRATIONS.EXCEL]: [
    {
      value: LEAD_INTEGRATION_TYPES.EXCEL_LEAD,
      label: LEAD_INTEGRATION_TYPES_LABELS[LEAD_INTEGRATION_TYPES.EXCEL_LEAD],
    },
  ],
  [CRM_INTEGRATIONS.HUBSPOT]: [
    {
      value: LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT,
      label:
        LEAD_INTEGRATION_TYPES_LABELS[LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT],
    },
  ],
  [CRM_INTEGRATIONS.SELLSY]: [
    {
      value: LEAD_INTEGRATION_TYPES.SELLSY_CONTACT,
      label:
        LEAD_INTEGRATION_TYPES_LABELS[LEAD_INTEGRATION_TYPES.SELLSY_CONTACT],
    },
  ],
  [CRM_INTEGRATIONS.ZOHO]: [
    {
      value: LEAD_INTEGRATION_TYPES.ZOHO_LEAD,
      label: LEAD_INTEGRATION_TYPES_LABELS[LEAD_INTEGRATION_TYPES.ZOHO_LEAD],
    },
    {
      value: LEAD_INTEGRATION_TYPES.ZOHO_CONTACT,
      label: LEAD_INTEGRATION_TYPES_LABELS[LEAD_INTEGRATION_TYPES.ZOHO_CONTACT],
    },
  ],
};

const LEAD_SOURCE_SITES = {
  EXTERNAL: 'external',
};

const WORKFLOW_LEVEL = {
  CADENCE: 'cadence',
  COMPANY: 'company',
};
const ZOHO_MODULE = {
  LEAD: 'Leads',
  CONTACT: 'Contacts',
  ACCOUNT: 'Accounts',
};
const PIPEDRIVE_MODULE = {
  PERSON: 'persons',
  DEAL: 'deals',
  PEOPLE: 'people',
};
const HUBSPOT_MODULE = {
  CONTACT: 'contacts',
};
const SALESFORCE_MODULE = {
  LEAD: 'lead',
  CONTACT: 'contact',
};

const CADENCE_OPTIONS = {
  SELECTED: 'selected',
  ALL: 'all',
};
const LEAD_SCORE_RUBRIKS = {
  EMAIL_CLICKED: 'email_clicked', // lead score reason added
  EMAIL_OPENED: 'email_opened', // lead score reason added
  EMAIL_REPLIED: 'email_replied', // lead score reason added
  SMS_CLICKED: 'sms_clicked', // lead score reason added
  INCOMING_CALL: 'incoming_call_received', // lead score reason added
  OUTGOING_CALL: 'outgoing_call', // lead score reason added
  STATUS_UPDATE: 'status_update',
  DEMO_BOOKED: 'demo_booked', // lead score reason added
  UNSUBSCRIBE: 'unsubscribe', // lead score reason added
  BOUNCED_MAIL: 'bounced_mail', // lead score reason added
  MANUAL_RESET: 'manual_reset', // lead score reason added
  CRON_RESET: 'cron_reset', // lead score reason added
  SETTINGS_RESET: 'settings_reset', // lead score reason added
};

const LEAD_WARMTH = {
  HOT: 'hot',
  COLD: 'cold',
};

const COMPANY_REGION = {
  EU: 'EU',
  US: 'US',
};

const CALLBACK_DEVICES = {
  ALL: 'ALL',
  APP: 'APP',
  EXT: 'EXT',
  MOB: 'MOB',
  SIP: 'SIP',
  WEB: 'WEB',
};

// Reverse mapping from priority to ID
const SETTINGS_ID_TYPES = {
  1: 'user_id',
  2: 'sd_id',
  3: 'company_id',
};

const SELLSY_CUSTOM_FIELDS = {
  CHECKBOX: 'checkbox',
  SIMPLE_TEXT: 'simple-text',
  DATE: 'date',
  TIME: 'time',
  EMAIL: 'email',
  SELECT: 'select',
  RADIO: 'radio',
  URL: 'url',
};

const SELLSY_ACTIVITY_TYPE = {
  EMAIL: 'email',
  SMS: 'sms',
};

// User languages that we support
const USER_LANGUAGES = {
  ENGLISH: 'english',
  FRENCH: 'french',
  SPANISH: 'spanish',
};

const DYNAMICS_ENDPOINTS = {
  LEAD: 'lead',
  ACCOUNT: 'account',
  CONTACT: 'contact',
  OPPORTUNITY: 'opportunity',
  USER: 'systemuser',
};
const ZOHO_DATA_CENTERS = {
  CHINA: 'china',
  REST_OF_THE_WORLD: 'rest of the world',
};

const DYNAMICS_DATA_IMPORT_TYPES = {
  CONTACT: 'contact',
  LEAD: 'lead',
  CONTACT_LIST: 'contact_list',
  LEAD_LIST: 'lead_list',
};

const DYNAMICS_LEAD_IMPORT_STATUS = {
  USER_NOT_PRESENT: 'user_not_present',
  LEAD_PRESENT_IN_TOOL: 'lead_present_in_tool',
  LEAD_ABSENT_IN_TOOL: 'lead_absent_in_tool',
  LEAD_INACTIVE: 'lead_inactive',
  COMPANY_NOT_PRESENT: 'company_not_present',
  FIRST_NAME_NOT_PRESENT: 'first_name_not_present',
  LEAD_ID_NOT_PRESENT: 'lead_id_not_present',
  CONTACT_ID_NOT_PRESENT: 'contact_id_not_present',
};

// FOR REDIS/RABBITMQ CLUSTER MODE
const CONNECTION_CLUSTER_ENABLE = {
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
};

const IMPORT_ERROR_TYPE = {
  CADENCE_ACCESS: 'cadence_access',
  DEFAULT: 'default',
};

// * Task statuses
const TASK_STATUSES = {
  INCOMPLETE: 'incomplete',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  SCHEDULED: 'scheduled',
};

// * Hubspot import sources
const HUBSPOT_IMPORT_SOURCE = {
  LIST: 'list',
  CONTACT: 'contact',
};

const BULLHORN_IMPORT_SOURCE = {
  CONTACT: 'ClientContact',
  LEAD: 'Lead',
  CANDIDATE: 'Candidate',
};

const SHEETS_CADENCE_INTEGRATION_TYPE = {
  SHEETS: 'sheets',
  EXCEL: 'excel',
};

const INTEGRATION_CHANGE_OPTIONS = {
  START_FROM_SCRATCH: 'start_from_scratch',
  KEEP_CADENCES_AND_SETTINGS: 'keep_cadences_and_settings',
  KEEP_EVERYTHING: 'keep_everything',
};

const LEAD_INTEGRATION_TYPES_TO_BE_DELETED_ON_INTEGRATION_CHANGE = {
  [CRM_INTEGRATIONS.SALESFORCE]: [
    LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD,
    LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT,
  ],
  [CRM_INTEGRATIONS.PIPEDRIVE]: [LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON],
  [CRM_INTEGRATIONS.HUBSPOT]: [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT],
  [CRM_INTEGRATIONS.ZOHO]: [
    LEAD_INTEGRATION_TYPES.ZOHO_LEAD,
    LEAD_INTEGRATION_TYPES.ZOHO_CONTACT,
  ],
  [CRM_INTEGRATIONS.SELLSY]: [LEAD_INTEGRATION_TYPES.SELLSY_CONTACT],
  [CRM_INTEGRATIONS.BULLHORN]: [
    LEAD_INTEGRATION_TYPES.BULLHORN_LEAD,
    LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT,
    LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE,
  ],
  [CRM_INTEGRATIONS.DYNAMICS]: [
    LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD,
    LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT,
  ],
  [CRM_INTEGRATIONS.SHEETS]: [
    LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD,
    LEAD_INTEGRATION_TYPES.EXCEL_LEAD,
  ],
};

const COMPANY_STATUS = {
  CONFIGURED: 'configured',
  NOT_CONFIGURED: 'not_configured',
  NOT_CONFIGURED_AFTER_INTEGRATION_CHANGE:
    'not_configured_after_integration_change',
};

const COMPANY_HISTORY_CHANGE_VALUES = {
  INTEGRATION_CHANGE: 'integration_change',
};

const PRODUCT_TOUR_STATUSES = {
  AFTER_ONBOARDING_PENDING: 'after_onboarding_pending',
  AFTER_ONBOARDGING_COMPLETED: 'after_onboarding_completed',
};

// * Mail scope levels
const MAIL_SCOPE_LEVEL = {
  STANDARD: 'standard',
  ADVANCE: 'advance',
};

const IMPORTED_LEAD_SOURCE = {
  GOOGLE_SHEET: 'google_sheet',
  CSV: 'csv',
};

const GOOGLE_SHEET_CSV_LEADS_INTEGRATION_TYPES = {
  [CRM_INTEGRATIONS.SALESFORCE]: {
    [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
      LEAD_INTEGRATION_TYPES.SALESFORCE_GOOGLE_SHEET_LEAD,
    [IMPORTED_LEAD_SOURCE.CSV]: LEAD_INTEGRATION_TYPES.SALESFORCE_CSV_LEAD,
  },
  [CRM_INTEGRATIONS.PIPEDRIVE]: {
    [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
      LEAD_INTEGRATION_TYPES.PIPEDRIVE_GOOGLE_SHEET_PERSON,
    [IMPORTED_LEAD_SOURCE.CSV]: LEAD_INTEGRATION_TYPES.PIPEDRIVE_CSV_PERSON,
  },
  [CRM_INTEGRATIONS.HUBSPOT]: {
    [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
      LEAD_INTEGRATION_TYPES.HUBSPOT_GOOGLE_SHEET_CONTACT,
    [IMPORTED_LEAD_SOURCE.CSV]: LEAD_INTEGRATION_TYPES.HUBSPOT_CSV_CONTACT,
  },
  [CRM_INTEGRATIONS.SELLSY]: {
    [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
      LEAD_INTEGRATION_TYPES.SELLSY_GOOGLE_SHEET_CONTACT,
    [IMPORTED_LEAD_SOURCE.CSV]: LEAD_INTEGRATION_TYPES.SELLSY_CSV_CONTACT,
  },
  [CRM_INTEGRATIONS.ZOHO]: {
    [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
      LEAD_INTEGRATION_TYPES.ZOHO_GOOGLE_SHEET_LEAD,
    [IMPORTED_LEAD_SOURCE.CSV]: LEAD_INTEGRATION_TYPES.ZOHO_CSV_LEAD,
  },
  [CRM_INTEGRATIONS.BULLHORN]: {
    [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
      LEAD_INTEGRATION_TYPES.BULLHORN_GOOGLE_SHEET_LEAD,
    [IMPORTED_LEAD_SOURCE.CSV]: LEAD_INTEGRATION_TYPES.BULLHORN_CSV_LEAD,
  },
  [CRM_INTEGRATIONS.SHEETS]: {
    [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
      LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD,
    [IMPORTED_LEAD_SOURCE.CSV]: LEAD_INTEGRATION_TYPES.EXCEL_LEAD,
  },
};

// * Possible default integration status values
const DEFAULT_INTEGRATION_STATUS = {
  CONTACT: 'contact',
  ACCOUNT: 'account',
};

const LEAD_IMPORT_SOURCE = {
  ADVANCED_WORKFLOW: 'advanced_workflow',
  LINKEDIN_EXTENSION: 'linkedIn_extension',
  IMPORT_BUTTON: 'import_button',
  CSV_IMPORT: 'csv_import',
  SHEET_IMPORT: 'sheet_import',
  CUSTOM_VIEW: 'custom_view',
};

const TRACKING_ACTIVITIES = {
  GOOGLE_SIGNED_OUT: 'google_signed_out',
  GOOGLE_SIGN_IN: 'google_signin',
  OUTLOOK_SIGNED_OUT: 'outlook_signed_out',
  OUTLOOK_SIGN_IN: 'outlook_signin',
  TEAM_CHANGED: 'team_changed',
  EXTENSION_SIGN_IN: 'extension_signin',
};

const TRACKING_REASONS = {
  TOKEN_EXPIRED_OR_REVOKED: 'token_expired_or_revoked',
  MANUALLY_SIGNED_OUT: 'manually_signed_out',
  MANUALLY_SIGNED_IN: 'manually_signed_in',
  MANUALLY_REVOKED: 'manually_revoked',
  TOKEN_EXPIRED_MORE_THAN_7_DAYS_AGO: 'token_expired_more_than_7_days_ago',
  SIGN_OUT_ALL_USERS: 'sign_out_all_users',
  MANUALLY_TEAM_CHANGED: 'manually_team_changed',
  ERROR_WHILE_RENEW_CHANNEL: 'error_while_renew_channel',
};

const TEAM_CHANGE_OPTIONS = {
  MOVE_LEADS_TO_ANOTHER_CADENCE: 'move_leads_to_another_cadence',
  UNLINK_LEADS_FROM_CADENCE: 'unlink_leads_from_cadence',
  DELETE_LEADS: 'delete_leads',
};

const DEFAULT_BULLHORN_INTEGRATION_STATUS = {
  CONTACT: 'contact',
  ACCOUNT: 'account',
  LEAD: 'lead',
};

const ONBOARDING_MAIL_STATUS = {
  PROCESSING: 'Processing',
  SENT: 'Sent',
  BOUNCED: 'Bounced',
  OPENED: 'Opened',
  COMPLAINED: 'Complained',
};

module.exports = {
  USER_ROLE,
  LEAD_STATUS,
  AGENDA_TYPE,
  AGENDA_FILTERS,
  LEAD_TYPE,
  MESSAGE_EVENT,
  CALL_DIRECTION,
  ACTIVITY_TYPE,
  OPPORTUNITY_STATUS,
  ACCOUNT_SIZE,
  LIVE_FEED_FILTER,
  HOMEPAGE_ACTIVE_CADENCE_TYPE,
  METRICS_FILTER,
  NODE_TYPES,
  HEATMAP_OPTIONS,
  NODE_DATA,
  LEADERBOARD_DATE_FILTERS,
  TASK_FILTERS,
  TAG_NAME,
  SORT_TYPES,
  SMART_ACTION_TYPE,
  EMAIL_STATUS,
  RBAC_ACTIONS,
  RBAC_RESOURCES,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  CADENCE_LEAD_ACTIONS,
  CADENCE_PRIORITY,
  CADENCE_STEPS_STATS_TYPE,
  LIST_STATUS,
  MONITORING_LEAD_STATUS,
  RINGOVER_CALL_STATES,
  USER_DELETE_OPTIONS,
  LUSHA_KASPR_OPTIONS,
  SALESFORCE_PHONE_NUMBER_FIELDS,
  SETTING_LEVELS,
  SETTING_TYPES,
  MAIL_SETTING_TYPES,
  DELAY_BETWEEN_EMAILS_OPTIONS,
  TASKS_FILTERS_REQUEST_KEYS,
  TASKS_FILTERS_REQUEST_VALUES,
  TEMPLATE_TYPE,
  TEMPLATE_LEVEL,
  DAYS_OF_WEEK,
  COMPANY_CONTACT_REASSIGNMENT_OPTIONS,
  COMPANY_ACCOUNT_REASSIGNMENT_OPTIONS,
  CUSTOM_TASK_NODE_ID,
  SALESFORCE_DATA_IMPORT_TYPES,
  SALESFORCE_LEAD_IMPORT_STATUS,
  RESPONSE_STATUS_CODE,
  INTEGRATION_TYPE,
  CALENDAR_INTEGRATION_TYPES,
  LEADS_FILTER_KEYS,
  LEADS_FILTER_VALUES,
  SALESFORCE_SOBJECTS,
  CADENCE_TYPES,
  CADENCE_ACTIONS,
  WORKFLOW_TRIGGERS,
  WORKFLOW_ACTIONS,
  PROFILE_IMPORT_TYPES,
  SALESFORCE_SYNC_OPTIONS,
  FORM_FIELDS_FOR_CUSTOM_OBJECTS,
  ENRICHMENT_SERVICES,
  LUSHA_TYPES,
  LUSHA_FIELD_MAP,
  INTEGRATION_SERVICES,
  CUSTOM_TASK_NODE_NAME,
  ACTIVITY_TEMPLATES,
  ACTIVITY_SUBTYPES,
  NOTIFICATION_TYPES,
  NOTIFICATION_SUBTYPES,
  NOTIFICATION_TEMPLATES,
  TEMPLATE_LABELS,
  TEMPLATE_ID_MAP,
  TEMPLATE_ACTIONS,
  MAIL_AUTO_RESPONSE_HEADERS,
  MAIL_AUTO_RESPONSE_HEADER_VALUES,
  CHATBOT_THREAD_STATUS,
  CHATBOT_TOKEN_TYPES,
  ACTIVE_CADENCE_FILTER,
  TEMPLATE_STATS_TYPE,
  CRM_INTEGRATIONS,
  PIPEDRIVE_ENDPOINTS,
  HUBSPOT_ENDPOINTS,
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
  USER_INTEGRATION_TYPES,
  FIELD_MAP_MODEL_NAMES,
  EXTENSION_FIELD_MAP_MODEL_NAMES,
  PIPEDRIVE_ACTIVITY_TYPES,
  PIPEDRIVE_VIEW_TYPES,
  CALENDAR_TIMEFRAME,
  CALENDAR_OFFSET,
  MAIL_INTEGRATION_TYPES,
  BULK_OPTIONS,
  PHONE_SYSTEM_TYPE,
  VIDEO_FORMAT,
  GOOGLE_SHEETS_EMAIL_FIELDS,
  GOOGLE_SHEETS_PHONE_NUMBER_FIELDS,
  EXCEL_EMAIL_FIELDS,
  EXCEL_PHONE_NUMBER_FIELDS,
  TASK_NAMES_BY_TYPE,
  WEBHOOK_TYPE,
  HTTP_METHOD,
  TASK_NAME_FOR_DISPLAY,
  IMAGE_FORMATS,
  ATTACHMENT_FORMATS,
  HUBSPOT_CONTACT_IMPORT_STATUS,
  GSHEETS_LEAD_STATUS,
  EXCEL_LEAD_STATUS,
  AUTOMATED_WORKFLOW_TRIGGERS,
  AUTOMATED_WORKFLOW_ACTIONS,
  AUTOMATED_WORKFLOW_FILTER_OPERATION,
  AUTOMATED_WORKFLOW_DATA_TYPES,
  MODEL_TYPES,
  AUTOMATED_WORKFLOW_FILTER_TYPES,
  AUTOMATED_WORKFLOW_FILTER_EQUATORS,
  CSV_LEADS_FIELD_MAP,
  SALESFORCE_CSV_IMPORT_FIELDS,
  SALESFORCE_PHONE_FIELDS,
  SALESFORCE_EMAIL_FIELDS,
  PIPEDRIVE_CSV_IMPORT_FIELDS,
  HUBSPOT_CSV_IMPORT_FIELDS,
  HUBSPOT_CSV_GS_IMPORT_FIELDS,
  ZOHO_CSV_IMPORT_FIELDS,
  SELLSY_CSV_IMPORT_FIELDS,
  BULLHORN_CSV_IMPORT_FIELDS,
  CUSTOM_VARIABLE_TYPES,
  ZOHO_ENDPOINTS,
  SELLSY_CONTACT_IMPORT_STATUS,
  SELLSY_ENDPOINTS,
  EXIT_SIGNALS,
  DARK_AVATAR_BACKGROUND_COLORS,
  ZOHO_DATA_IMPORT_TYPES,
  FALLBACK_VARIABLES,
  WORKFLOW_DEFAULT_NAMES,
  SMS_STATUS,
  IMPORT_OPTIONS,
  WEBHOOK_ACTIVITY_TYPES,
  TRANSLATED_DAYS,
  LEAD_INTEGRATION_TYPES_DROPDOWN,
  LEAD_SOURCE_SITES,
  COMPARE_CADENCE_KPI_TYPE,
  COMPARE_CADENCE_VALUE_TYPE,
  COMPARE_CADENCE_COMPARISION_TYPE,
  COMPARE_CADENCE_PERCENTAGE_TYPE,
  STATISTICS_DATE_COLUMN_TYPE,
  STATISTICS_TABLE_GROUP_BY_TYPE,
  AUTOMATED_NODE_TYPES_ARRAY,
  WORKFLOW_LEVEL,
  ZOHO_MODULE,
  BULLHORN_ENDPOINTS,
  HIRING_INTEGRATIONS,
  CADENCE_OPTIONS,
  LEAD_SCORE_RUBRIKS,
  LEAD_WARMTH,
  COMPANY_REGION,
  INTEGRATIONS_TYPE,
  BULLHORN_DATA_IMPORT_TYPES,
  CALLBACK_DEVICES,
  SETTINGS_ID_TYPES,
  USER_LANGUAGES,
  SELLSY_CUSTOM_FIELDS,
  SELLSY_ACTIVITY_TYPE,
  DYNAMICS_ENDPOINTS,
  ZOHO_DATA_CENTERS,
  DYNAMICS_DATA_IMPORT_TYPES,
  DYNAMICS_LEAD_IMPORT_STATUS,
  CONNECTION_CLUSTER_ENABLE,
  IMPORT_ERROR_TYPE,
  TASK_STATUSES,
  HUBSPOT_IMPORT_SOURCE,
  PIPEDRIVE_MODULE,
  HUBSPOT_MODULE,
  SALESFORCE_MODULE,
  SHEETS_CADENCE_INTEGRATION_TYPE,
  INTEGRATION_CHANGE_OPTIONS,
  LEAD_INTEGRATION_TYPES_TO_BE_DELETED_ON_INTEGRATION_CHANGE,
  COMPANY_STATUS,
  COMPANY_HISTORY_CHANGE_VALUES,
  MAIL_SCOPE_LEVEL,
  TEAM_CHANGE_OPTIONS,
  BULLHORN_IMPORT_SOURCE,
  PRODUCT_TOUR_STATUSES,
  IMPORTED_LEAD_SOURCE,
  GOOGLE_SHEET_CSV_LEADS_INTEGRATION_TYPES,
  DEFAULT_INTEGRATION_STATUS,
  LEAD_IMPORT_SOURCE,
  TRACKING_REASONS,
  TRACKING_ACTIVITIES,
  DEFAULT_BULLHORN_INTEGRATION_STATUS,
  ONBOARDING_MAIL_STATUS,
};
