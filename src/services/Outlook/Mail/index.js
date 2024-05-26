const Inbox = require('./lib/Inbox');
const Outbox = require('./lib/Outbox');
const Subscriptions = require('./lib/Subscriptions');

const Mail = {
  Inbox,
  Outbox,
  Subscriptions,
};

module.exports = Mail;
