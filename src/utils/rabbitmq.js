// Utils
const logger = require('./winston');
const {
  RABBITMQ_URL,
  RABBITMQ_CERT,
  RABBITMQ_KEY,
  RABBITMQ_CA,
  RABBITMQ_CLUSTER_ENABLE,
} = require('./config');
const fs = require('fs');

// Packages
const amqp = require('amqplib/callback_api');

let connection = null;

const getConnection = () => {
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
      if (err) {
        logger.error(
          `Error while connecting to rabbit mq instance: ${err.message}.`
        );
        return reject(null);
      }

      logger.info(`Connection Established to Rabbit Mq.`);
      connection = newConnection;
      return resolve(connection);
    });
  });
};

module.exports = getConnection;
