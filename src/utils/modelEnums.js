const {
  Excel_Field_Map,
  A_B_Testing,
  Account,
  Activity,
  Agenda,
  Attachment,
  Automated_Task_Settings,
  Automated_Tasks,
  Automated_Workflow,
  Bounced_Mail_Settings,
  Bullhorn_Field_Map,
  Bullhorn_Tokens,
  Cadence,
  Cadence_Schedule,
  Cadence_Template,
  Calendar_Settings,
  Chatbot,
  Company,
  Company_History,
  Company_Settings,
  Company_Tokens,
  Conversation,
  Custom_Domain,
  Daily_Tasks,
  Demo,
  Department,
  Dynamics_Field_Map,
  Dynamics_Tokens,
  EFM_Bullhorn,
  EFM_Dynamics,
  EFM_Excel,
  EFM_GoogleSheets,
  EFM_Hubspot,
  EFM_Pipedrive,
  EFM_Salesforce,
  EFM_Sellsy,
  EFM_Zoho,
  Email,
  Email_Settings,
  Email_Template,
  Enrichments,
  Google_Sheets_Field_Map,
  Hubspot_Field_Map,
  Hubspot_Imports,
  Hubspot_Tokens,
  Lead,
  Lead_email,
  Lead_phone_number,
  Lead_Score_Reasons,
  Lead_Score_Settings,
  LeadToCadence,
  LinkStore,
  Linkedin_Template,
  List,
  Message,
  Message_Template,
  Node,
  Note,
  Openai_Log,
  Opportunity,
  Pipedrive_Field_Map,
  Pipedrive_Tokens,
  Recent_Action,
  Ringover_Tokens,
  Salesforce_Field_Map,
  Salesforce_Tokens,
  Script_Template,
  Sellsy_Field_Map,
  Sellsy_Tokens,
  Settings,
  Signature,
  Skip_Settings,
  Statistics_Status_Store,
  Statistics_Store,
  Status,
  Sub_Department,
  Sub_Department_Settings,
  Support_Agent,
  Tag,
  Task,
  Task_Settings,
  Tracking,
  Unsubscribe_Mail_Settings,
  User,
  User_Cadence,
  User_Task,
  User_Token,
  Valid_Access_Token,
  Video,
  Video_Template,
  Video_Tracking,
  Webhook,
  Whatsapp_Template,
  Workflow,
  Zoho_Field_Map,
  Zoho_Tokens,
  Zoho_Webhook,
} = require('../db/models');

const DB_TABLES = {
  EXCEL_FIELD_MAP: 'excel_field_map',
  A_B_TESTING: 'a_b_testing',
  ACCOUNT: 'account',
  ACTIVITY: 'activity',
  AGENDA: 'agenda',
  ATTACHMENT: 'attachment',
  AUTOMATED_TASK_SETTINGS: 'automated_task_settings',
  AUTOMATED_TASKS: 'automated_tasks',
  AUTOMATED_WORKFLOW: 'automated_workflow',
  BOUNCED_MAIL_SETTINGS: 'bounced_mail_settings',
  BULLHORN_FIELD_MAP: 'bullhorn_field_map',
  BULLHORN_TOKENS: 'bullhorn_tokens',
  CADENCE: 'cadence',
  CADENCE_SCHEDULE: 'cadence_schedule',
  CADENCE_TEMPLATE: 'cadence_template',
  CALENDAR_SETTINGS: 'calendar_settings',
  CHATBOT: 'chatbot',
  COMPANY: 'company',
  COMPANY_HISTORY: 'company_history',
  COMPANY_SETTINGS: 'company_settings',
  COMPANY_TOKENS: 'company_tokens',
  CONVERSATION: 'conversation',
  CUSTOM_DOMAIN: 'custom_domain',
  DAILY_TASKS: 'daily_tasks',
  DEMO: 'demo',
  DEPARTMENT: 'department',
  DYNAMICS_FIELD_MAP: 'dynamics_field_map',
  DYNAMICS_TOKENS: 'dynamics_tokens',
  EFM_BULLHORN: 'efm_bullhorn',
  EFM_DYNAMICS: 'efm_dynamics',
  EFM_EXCEL: 'efm_excel',
  EFM_GOOGLESHEETS: 'efm_googlesheets',
  EFM_HUBSPOT: 'efm_hubspot',
  EFM_PIPEDRIVE: 'efm_pipedrive',
  EFM_SALESFORCE: 'efm_salesforce',
  EFM_SELLSY: 'efm_sellsy',
  EFM_ZOHO: 'efm_zoho',
  EMAIL: 'email',
  EMAIL_SETTINGS: 'email_settings',
  EMAIL_TEMPLATE: 'email_template',
  ENRICHMENTS: 'enrichments',
  GOOGLE_SHEETS_FIELD_MAP: 'google_sheets_field_map',
  HUBSPOT_FIELD_MAP: 'hubspot_field_map',
  HUBSPOT_IMPORTS: 'hubspot_imports',
  HUBSPOT_TOKENS: 'hubspot_tokens',
  LEAD: 'lead',
  LEAD_EMAIL: 'lead_email',
  LEAD_PHONE_NUMBER: 'lead_phone_number',
  LEAD_SCORE_REASONS: 'lead_score_reasons',
  LEAD_SCORE_SETTINGS: 'lead_score_settings',
  LEADTOCADENCE: 'leadtocadence',
  LINKSTORE: 'linkstore',
  LINKEDIN_TEMPLATE: 'linkedin_template',
  LIST: 'list',
  MESSAGE: 'message',
  MESSAGE_TEMPLATE: 'message_template',
  NODE: 'node',
  NOTE: 'note',
  OPENAI_LOG: 'openai_log',
  OPPORTUNITY: 'opportunity',
  PIPEDRIVE_FIELD_MAP: 'pipedrive_field_map',
  PIPEDRIVE_TOKENS: 'pipedrive_tokens',
  RECENT_ACTION: 'recent_action',
  RINGOVER_TOKENS: 'ringover_tokens',
  SALESFORCE_FIELD_MAP: 'salesforce_field_map',
  SALESFORCE_TOKENS: 'salesforce_tokens',
  SCRIPT_TEMPLATE: 'script_template',
  SELLSY_FIELD_MAP: 'sellsy_field_map',
  SELLSY_TOKENS: 'sellsy_tokens',
  SETTINGS: 'settings',
  SIGNATURE: 'signature',
  SKIP_SETTINGS: 'skip_settings',
  STATISTICS_STATUS_STORE: 'statistics_status_store',
  STATISTICS_STORE: 'statistics_store',
  STATUS: 'status',
  SUB_DEPARTMENT: 'sub_department',
  SUB_DEPARTMENT_SETTINGS: 'sub_department_settings',
  SUPPORT_AGENT: 'support_agent',
  TAG: 'tag',
  TASK: 'task',
  TASK_SETTINGS: 'task_settings',
  TRACKING: 'tracking',
  UNSUBSCRIBE_MAIL_SETTINGS: 'unsubscribe_mail_settings',
  USER: 'user',
  USER_CADENCE: 'user_cadence',
  USER_TASK: 'user_task',
  USER_TOKEN: 'user_token',
  VALID_ACCESS_TOKEN: 'valid_access_token',
  VIDEO: 'video',
  VIDEO_TEMPLATE: 'video_template',
  VIDEO_TRACKING: 'video_tracking',
  WEBHOOK: 'webhook',
  WHATSAPP_TEMPLATE: 'whatsapp_template',
  WORKFLOW: 'workflow',
  ZOHO_FIELD_MAP: 'zoho_field_map',
  ZOHO_TOKENS: 'zoho_tokens',
  ZOHO_WEBHOOK: 'zoho_webhook',
};

const DB_MODELS = {
  excel_field_map: Excel_Field_Map,
  a_b_testing: A_B_Testing,
  account: Account,
  activity: Activity,
  agenda: Agenda,
  attachment: Attachment,
  automated_task_settings: Automated_Task_Settings,
  automated_tasks: Automated_Tasks,
  automated_workflow: Automated_Workflow,
  bounced_mail_settings: Bounced_Mail_Settings,
  bullhorn_field_map: Bullhorn_Field_Map,
  bullhorn_tokens: Bullhorn_Tokens,
  cadence: Cadence,
  cadence_schedule: Cadence_Schedule,
  cadence_template: Cadence_Template,
  calendar_settings: Calendar_Settings,
  chatbot: Chatbot,
  company: Company,
  company_history: Company_History,
  company_settings: Company_Settings,
  company_tokens: Company_Tokens,
  conversation: Conversation,
  custom_domain: Custom_Domain,
  daily_tasks: Daily_Tasks,
  demo: Demo,
  department: Department,
  dynamics_field_map: Dynamics_Field_Map,
  dynamics_tokens: Dynamics_Tokens,
  efm_bullhorn: EFM_Bullhorn,
  efm_dynamics: EFM_Dynamics,
  efm_excel: EFM_Excel,
  efm_googlesheets: EFM_GoogleSheets,
  efm_hubspot: EFM_Hubspot,
  efm_pipedrive: EFM_Pipedrive,
  efm_salesforce: EFM_Salesforce,
  efm_sellsy: EFM_Sellsy,
  efm_zoho: EFM_Zoho,
  email: Email,
  email_settings: Email_Settings,
  email_template: Email_Template,
  enrichments: Enrichments,
  google_sheets_field_map: Google_Sheets_Field_Map,
  hubspot_field_map: Hubspot_Field_Map,
  hubspot_imports: Hubspot_Imports,
  hubspot_tokens: Hubspot_Tokens,
  lead: Lead,
  lead_email: Lead_email,
  lead_phone_number: Lead_phone_number,
  lead_score_reasons: Lead_Score_Reasons,
  lead_score_settings: Lead_Score_Settings,
  leadtocadence: LeadToCadence,
  linkstore: LinkStore,
  linkedin_template: Linkedin_Template,
  list: List,
  message: Message,
  message_template: Message_Template,
  node: Node,
  note: Note,
  openai_log: Openai_Log,
  opportunity: Opportunity,
  pipedrive_field_map: Pipedrive_Field_Map,
  pipedrive_tokens: Pipedrive_Tokens,
  recent_action: Recent_Action,
  ringover_tokens: Ringover_Tokens,
  salesforce_field_map: Salesforce_Field_Map,
  salesforce_tokens: Salesforce_Tokens,
  script_template: Script_Template,
  sellsy_field_map: Sellsy_Field_Map,
  sellsy_tokens: Sellsy_Tokens,
  settings: Settings,
  signature: Signature,
  skip_settings: Skip_Settings,
  statistics_status_store: Statistics_Status_Store,
  statistics_store: Statistics_Store,
  status: Status,
  sub_department: Sub_Department,
  sub_department_settings: Sub_Department_Settings,
  support_agent: Support_Agent,
  tag: Tag,
  task: Task,
  task_settings: Task_Settings,
  tracking: Tracking,
  unsubscribe_mail_settings: Unsubscribe_Mail_Settings,
  user: User,
  user_cadence: User_Cadence,
  user_task: User_Task,
  user_token: User_Token,
  valid_access_token: Valid_Access_Token,
  video: Video,
  video_template: Video_Template,
  video_tracking: Video_Tracking,
  webhook: Webhook,
  whatsapp_template: Whatsapp_Template,
  workflow: Workflow,
  zoho_field_map: Zoho_Field_Map,
  zoho_tokens: Zoho_Tokens,
  zoho_webhook: Zoho_Webhook,
};

module.exports = { DB_TABLES, DB_MODELS };
