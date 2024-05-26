// Utils
const { CUSTOM_VARIABLE_TYPES } = require('../../../../utils/enums');

const formatter = (str, variable_type) => {
  str = str.replace(/-/g, ' ');
  str = str.replace(/_/g, ' ');
  str = str.replace(/'/g, ' ');
  let modStr = '';
  str.split(' ').forEach((subStr) => {
    if (subStr !== '')
      modStr += subStr.charAt(0).toUpperCase() + subStr.slice(1);
  });
  switch (variable_type) {
    case CUSTOM_VARIABLE_TYPES.LEAD:
      modStr = `${modStr}_L`;
      break;
    case CUSTOM_VARIABLE_TYPES.CONTACT:
      modStr = `${modStr}_C`;
      break;
    case CUSTOM_VARIABLE_TYPES.ACCOUNT:
      modStr = `${modStr}_A`;
      break;
    case CUSTOM_VARIABLE_TYPES.PERSON:
      modStr = `${modStr}_P`;
      break;
    case CUSTOM_VARIABLE_TYPES.ORGANIZATION:
      modStr = `${modStr}_O`;
      break;
    case CUSTOM_VARIABLE_TYPES.COMPANY:
      modStr = `${modStr}_Co`;
      break;
    case CUSTOM_VARIABLE_TYPES.CANDIDATE:
      modStr = `${modStr}_Cn`;
      break;
  }
  return modStr;
};

module.exports = formatter;
