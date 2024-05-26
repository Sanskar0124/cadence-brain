const TIME_DIFF_FOR_NEW_LEAD = 3;

const URGENT_TIME_DIFF_FOR_INBOUND = 2; // * in hours

const URGENT_TIME_DIFF_FOR_OUTBOUND = 12; // * in hours

const PENDING_TASKS_LIMIT = 100;

const LEAD_CADENCE_ORDER_MAX = 2147000000;

const REDIS_ADDED_TASK_IDS = 'added-task-ids';

const REDIS_ADDED_USER_IDS = 'added-user-ids';

const AMQP_QUEUE = 'tasks';

const AWQ_QUEUE = 'advance-workflow';

const AWQ_EXCHANGE = 'advance-workflow-exchange';

const AMQP_DELAY_EXCHANGE = 'tasks-delay-exchange';

const REDIS_ADDED_USER_IDS_FOR_MAIL = 'added-user-ids-for-mail';

const REDIS_ADDED_USER_IDS_FOR_MESSAGE = 'added-user-ids-for-message';

const DAILY_USER_TASKS_QUEUE = 'daily-user-tasks';

const REDIS_TASK_SUMMARY = 'redis_task_summary';

const REDIS_EMPTY_STATS_COMPANY = 'redis_empty_stats_company';

const REDIS_TASK_SUMMARY_EXPIRY = 1 * 60 * 60; // 1 hour = 3600sec

const OUTLOOK_ACCESS_TOKEN_REDIS_KEY = 'outlook-access-token';

const SUPPORT_AGENT_ACCESS_DURATION = 3600000;
const MOBILE = [
  '+336',
  '+337',
  '+447',
  // SPAIN
  '+346',
  '+3471',
  '+3472',
  '+3473',
  '+3474',
  '+3475',
  '+3476',
  '+3477',
  '+3478',
  '+3479',
];
const LANDLINE = [
  '+331',
  '+332',
  '+333',
  '+334',
  '+335',
  '+339',
  '+338',
  '+441',
  '+442',
  '+443',
  '+4444',
  '+445',
];

const REDIS_LAST_MAIL_SCHEDULED_AT = 'last_mail_scheduled_at';
const LINKEDIN_PEOPLE_REGEX = /https:\/\/www.linkedin.com\/in\/[a-z0-9_-]+/g;

const PIPEDRIVE_HTTP_USERNAME = '';

const PIPEDRIVE_HTTP_PASSWORD = '';

const ZOHO_SERVER_URL = [
  'https://accounts.zoho.com',
  'https://accounts.zoho.eu',
  'https://accounts.zoho.in',
  'https://accounts.zoho.com.au',
  'https://accounts.zoho.jp',
  'https://accounts.zoho.uk',
  'https://accounts.zohoone.ca',
  'https://accounts.zoho.com.cn',
];

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[\W_])(?=.{8,})(?!.*\s).+$/;

const MORGAN_REQ_LOG_FORMAT =
  ':correlationId :user [:date[clf]] :method :url :status :res[content-length] - :response-time ms :emoji';

const REDIS_AUTOMATED_TASK = 'automated_task';
const REDIS_RINGOVER_ACCESS_TOKEN = 'ringoverAccessToken_';

const SUPPORTED_STANDARD_VARIABLES_FALLBACK = {
  //prospect variables
  first_name: '',
  last_name: '',
  company: '',
  email: '',
  phone_number: '',
  occupation: '',
  owner: '',
  linkedin_url: '',
  signature: '',
  allSignatures: '',
  //Account Variables
  account_linkedin_url: '',
  account_website_url: '',
  account_size: '',
  account_zipcode: '',
  account_country: '',
  account_phone_number: '',
  //sender variables
  sender_first_name: '',
  sender_last_name: '',
  sender_name: '',
  sender_email: '',
  sender_phone_number: '',
  sender_company: '',
  //Date Variables
  today: '',
  today_day: '',
  tomorrow: '',
  tomorrow_day: '',
  fromTimezone: '',
  calendly_link: '',
  //Others
  zoom_info: '',
};

const PIPEDRIVE_PHONE_FIELDS = ['work', 'home', 'mobile', 'other'];

const PIPEDRIVE_EMAIL_FIELDS = ['work', 'home', 'other'];

// * Chat GPT Model
CHAT_GPT_TURBO_MODEL = 'gpt-3.5-turbo';

GCP_PRIVATE_BUCKET_URL =
  'https://storage.googleapis.com/apt-cubist-307713-private/crm/attachments';

const PREFIX_FOR_PRODUCT_TOUR_DUMMY_LEAD_INTEGRATION_ID = 'product_tour_dummy';

const INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE = 'product_tour_cadence';

const EMAIL_REGEX =
  /^(?![-.])(?!.*\.{2})(?=[^@]*[a-zA-Z0-9._%+-])^[a-zA-Z0-9][a-zA-Z0-9._%+-]{0,61}@[a-zA-Z0-9.-]{1,63}\.[a-zA-Z]{2,63}$/;
const PHONE_REGEX =
  /^(?:\+\d{1,3}\s?)?(?:\(\d{1,4}\)\s?)?(?:\d{1,4}[\s-])?\d{7,14}$/;
const LINKEDIN_REGEX =
  /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_%\-]+\/?$/;
const WEBSITE_URL_REGEX =
  /^(https?:\/\/)?([\w.-]{1,100})\.([a-z]{2,})(:\d{2,5})?(\/\S*)?$/i;
const GOOGLE_SHEETS_REGEX =
  /https:\/\/docs.google.com\/spreadsheets\/d\/(.+)\/.+/;

module.exports = {
  TIME_DIFF_FOR_NEW_LEAD,
  URGENT_TIME_DIFF_FOR_INBOUND,
  URGENT_TIME_DIFF_FOR_OUTBOUND,
  PENDING_TASKS_LIMIT,
  LEAD_CADENCE_ORDER_MAX,
  REDIS_ADDED_TASK_IDS,
  REDIS_ADDED_USER_IDS,
  AMQP_QUEUE,
  AMQP_DELAY_EXCHANGE,
  REDIS_ADDED_USER_IDS_FOR_MAIL,
  REDIS_ADDED_USER_IDS_FOR_MESSAGE,
  DAILY_USER_TASKS_QUEUE,
  REDIS_TASK_SUMMARY,
  REDIS_TASK_SUMMARY_EXPIRY,
  REDIS_EMPTY_STATS_COMPANY,
  MOBILE,
  LANDLINE,
  REDIS_LAST_MAIL_SCHEDULED_AT,
  LINKEDIN_PEOPLE_REGEX,
  PIPEDRIVE_HTTP_USERNAME,
  PIPEDRIVE_HTTP_PASSWORD,
  OUTLOOK_ACCESS_TOKEN_REDIS_KEY,
  SUPPORT_AGENT_ACCESS_DURATION,
  ZOHO_SERVER_URL,
  PASSWORD_REGEX,
  MORGAN_REQ_LOG_FORMAT,
  REDIS_AUTOMATED_TASK,
  SUPPORTED_STANDARD_VARIABLES_FALLBACK,
  CHAT_GPT_TURBO_MODEL,
  PIPEDRIVE_PHONE_FIELDS,
  PIPEDRIVE_EMAIL_FIELDS,
  GCP_PRIVATE_BUCKET_URL,
  PREFIX_FOR_PRODUCT_TOUR_DUMMY_LEAD_INTEGRATION_ID,
  INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE,
  EMAIL_REGEX,
  PHONE_REGEX,
  LINKEDIN_REGEX,
  WEBSITE_URL_REGEX,
  GOOGLE_SHEETS_REGEX,
  AWQ_QUEUE,
  AWQ_EXCHANGE,
  REDIS_RINGOVER_ACCESS_TOKEN,
};
