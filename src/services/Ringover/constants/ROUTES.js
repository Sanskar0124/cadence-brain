const ROUTES = {
  GET_USER: (user_id) => `/users/${user_id}`,
  GET_CONVERSATION: (convId) => `/conversations/${convId}/messages`,
  SEND_MESSAGE: `/push/sms`,
  GET_USER_PRESENCE: (user_id) => `/users/${user_id}/presences`,
  CREATE_CALLBACK: `/callback`,
};

module.exports = ROUTES;
