const redisClient = require('./redis');

//ping redis
const redisHealthCheck = () => {
  return new Promise((resolve, reject) => {
    redisClient.ping((err, reply) => {
      if (err) resolve([null, err?.message]);
      resolve([reply, null]);
    });
  });
};

module.exports = redisHealthCheck;
