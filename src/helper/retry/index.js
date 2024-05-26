const { delay } = require('../delay');

const retry = async (prom, args, attempts = 4, wait = 60000) => {
  let count = 0;
  while (count++ < attempts) {
    try {
      const [result, err] = await prom(args);
      console.log('resutl is ', result);
      if (err) throw err;
      return [result, null];
    } catch (e) {
      if (count === attempts) return [null, e.message];
      await delay(wait);
    }
  }
};

const RetryHelper = {
  retry,
};

module.exports = RetryHelper;
