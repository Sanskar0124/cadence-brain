const { REDIS_URL, REDIS_CA, REDIS_CERT, REDIS_KEY } = require('./config');
const fs = require('fs');
const redis = require('redis');

let connectionObject = {
  url: REDIS_URL,
};

if (REDIS_CA && REDIS_CERT && REDIS_KEY)
  connectionObject.tls = {
    ca: fs.readFileSync(REDIS_CA),
    cert: fs.readFileSync(REDIS_CERT),
    key: fs.readFileSync(REDIS_KEY),
    rejectUnauthorized: false,
  };

const client = redis.createClient(connectionObject);

client.on('error', function (error) {
  console.log(error);
});

module.exports = client;
