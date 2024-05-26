/* eslint-disable new-cap */
// Packages
const { createLogger, format, transports } = require('winston');

// logging and monitoring
const winston = require('winston');
const LokiTransport = require('winston-loki');
const {
  combine,
  timestamp,
  label,
  printf,
  prettyPrint,
  json,
  colorize,
  align,
} = format;

require('winston-daily-rotate-file');

// Utils
const { NODE_ENV } = require('./config');

const myformat = combine(
  colorize(),
  timestamp(),
  align(),
  printf((info) => {
    if (info.stack) {
      try {
        let stackTrace = info.stack
          .split('CRM-Backend')[1]
          .split(')')[0]
          .trim();
        return `${info.timestamp} ${info.level}: ${info.message} \t Traceback: CRM-BACKEND${stackTrace}`;
      } catch (err) {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      }
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

const rotateFormat = combine(
  json(),
  timestamp(),
  prettyPrint(),
  printf((info) => {
    if (info.stack) {
      try {
        let stackTrace = info.stack
          .split('CRM-Backend')[1]
          .split(')')[0]
          .trim();
        return `${info.timestamp} ${info.level}: ${info.message} \t Traceback: CRM-BACKEND${stackTrace}`;
      } catch (err) {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      }
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

const ServerTransport = new transports.DailyRotateFile({
  filename: './logs/server-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'info',
  format: rotateFormat,
});

const ErrorTransport = new transports.DailyRotateFile({
  filename: './logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'error',
  format: rotateFormat,
});

const DebugTransport = new transports.DailyRotateFile({
  filename: './logs/debug-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'debug',
  format: rotateFormat,
});

const logger = new createLogger({
  transports: [
    ServerTransport,
    ErrorTransport,
    DebugTransport,
    new transports.Console({
      level: NODE_ENV === 'production' ? 'info' : 'debug',
      handleExceptions: true,
      format: myformat,
    }),
    new LokiTransport({
      host: process.env.REMOTE_LOKI,
      basicAuth: process.env.LOKI_AUTH,
      json: true,
      labels: { job: process.env.JOB },
      format: myformat,
    }),
  ],
  exitOnError: false,
});

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

module.exports = logger;
