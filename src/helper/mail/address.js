const logger = require('../../utils/winston');

const getEmailFromEntity = (fromHeader) => {
  try {
    if (!fromHeader) return null;
    fromHeader = fromHeader.toLowerCase();

    const rfc2822EmailRegex =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    const result = fromHeader.match(rfc2822EmailRegex);
    if (result) return result[0];
    return null;
  } catch (err) {
    logger.error(`Error in extracting email from entity`, err);
    return null;
  }
};

const getBouncedMailAddressInOutlook = (body) => {
  try {
    const regExp = /[m][a][i][l][t][o][:].*?\"/g;
    const result = body.match(regExp);
    if (result) {
      let mailAddress = result[0].substring(7, result[0].length - 1);
      mailAddress = mailAddress.replace('%2B', '+');
      if (result) return mailAddress;
    }
    return null;
  } catch (err) {
    logger.error(`Error in extracting bounce mail from outlookMailBody`, err);
    return null;
  }
};

module.exports = { getEmailFromEntity, getBouncedMailAddressInOutlook };
