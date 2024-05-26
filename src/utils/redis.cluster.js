const {
  REDIS_URL,
  REDIS_CLUSTER_ENABLE,
  REDIS_USER,
  REDIS_PASSWORD,
  REDIS_ROOT_1,
  REDIS_ROOT_2,
  REDIS_ROOT_3,
  REDIS_CA,
  REDIS_CERT,
  REDIS_KEY,
} = require('./config');
const fs = require('fs');
const redis = require('redis');
const logger = require('./winston');
const { CONNECTION_CLUSTER_ENABLE } = require('./enums');
let client;
(() => {
  if (REDIS_CLUSTER_ENABLE === CONNECTION_CLUSTER_ENABLE.ENABLE) {
    // Create a Redis Cluster
    client = redis.createCluster({
      rootNodes: [
        {
          url: REDIS_ROOT_1,
        },
        {
          url: REDIS_ROOT_2,
        },
        {
          url: REDIS_ROOT_3,
        },
      ],
      useReplicas: true,
      defaults: {
        username: REDIS_USER,
        password: REDIS_PASSWORD,
        socket: {
          tls: true,
          ca: fs.readFileSync(REDIS_CA),
          cert: fs.readFileSync(REDIS_CERT),
          key: fs.readFileSync(REDIS_KEY),
          connectTimeout: 50000,
        },
      },
    });
    client
      .connect()
      .then(() => {
        logger.info('Connected to Redis Server');
      })
      .catch(() => {
        logger.error('Could not connect to redis server');
      });
  } else {
    client = redis.createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 50000,
      },
      legacyMode: true,
    });
    client
      .connect()
      .then(() => {
        logger.info('Connected to Redis Server');
      })
      .catch(() => {
        logger.error('Could not connect to redis server');
      });
  }
})();

module.exports = client;
