const amqp = require('amqplib/callback_api');
const {
  RABBITMQ_URL,
  RABBITMQ_CA,
  RABBITMQ_CERT,
  RABBITMQ_CLUSTER_ENABLE,
  RABBITMQ_KEY,
} = require('./config');

const amqpHealthCheck = () => {
  let opts = {};
  if (RABBITMQ_CLUSTER_ENABLE)
    opts = {
      cert: fs.readFileSync(RABBITMQ_CERT),
      key: fs.readFileSync(RABBITMQ_KEY),
      ca: fs.readFileSync(RABBITMQ_CA),
      rejectUnauthorized: false,
    };
  return new Promise((resolve, reject) => {
    amqp.connect(RABBITMQ_URL, opts, (err, newConnection) => {
      // * If error, return
      if (err) resolve([null, err?.message]);
      resolve(['connection', null]);
    });
  });
};

module.exports = amqpHealthCheck;
