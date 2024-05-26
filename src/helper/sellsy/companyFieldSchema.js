const logger = require('../../utils/winston');

const { address_fields } = require('./describeCompanyFields');

const companyFieldSchema = (data) => {
  try {
    let mappedData = {};

    for (let key in data) {
      let field = data[key];

      if (
        address_fields.some(({ value: addressValue }) => addressValue === field)
      )
        continue;
      else mappedData[key] = field;
    }

    return [mappedData, null];
  } catch (err) {
    logger.error('Error while checking field map: ', err);
    return [null, err.message];
  }
};

module.exports = companyFieldSchema;
