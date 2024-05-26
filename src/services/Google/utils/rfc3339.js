const _toDate = require('@fav/type.to-date');

const toDate = (rfc) => {
  return _toDate.RFC3339(rfc);
};

const fromDate = (d = new Date()) => {
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }
  return (
    d.getUTCFullYear() +
    '-' +
    pad(d.getUTCMonth() + 1) +
    '-' +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    ':' +
    pad(d.getUTCMinutes()) +
    ':' +
    pad(d.getUTCSeconds()) +
    'Z'
  );
};

const toDateTime = (rfc3339DateFormatString, timeZone) => {
  return new Date(rfc3339DateFormatString).toLocaleString('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

const rfc3339 = { toDate, fromDate, toDateTime };

module.exports = rfc3339;
