const logger = require('../../utils/winston');

const getRandomString = (length) => {
  try {
    let result = '';
    let characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=|?<>';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++)
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return [result, null];
  } catch (err) {
    logger.error('Error while getting random string: ', err);
    return [null, err.message];
  }
};

module.exports = getRandomString;
