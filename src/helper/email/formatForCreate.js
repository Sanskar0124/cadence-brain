// Utils
const logger = require('../../utils/winston');

const formatForCreate = async (emails, lead_id, set_primary = true) => {
  try {
    let emailList = [];
    let flag = 0;

    for (let emailObj of emails) {
      let obj = emailObj;
      if (obj.email_id == undefined || obj.email_id === '') obj.email_id = '';
      else if (flag === 0 && set_primary) {
        obj.is_primary = true;
        flag = 1;
      }
      obj.lead_id = lead_id;
      emailList.push(obj);
    }
    return [emailList, null];
  } catch (err) {
    logger.error(`Error while formating email for create: `, err);
    return [null, err.message];
  }
};

module.exports = formatForCreate;
