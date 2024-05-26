const logger = require('../../utils/winston');

const mapSellsyField = (obj, map) => {
  try {
    let data = {};
    // set all the mapped values to null if object is empty
    if (!Object.keys(obj)?.length) {
      for (const mapValue of Object.values(map)) data[mapValue] = null;
      return [data, null];
    }

    for (let [key, value] of Object.entries(map)) {
      if (value.includes('.')) {
        let objectKeys = value.split('.');
        if (obj[objectKeys[0]] === null) data[key] = null;
        else data[key] = obj[objectKeys[0]][objectKeys[1]];
      } else if (Array.isArray(value)) {
        let arr = [];
        switch (key) {
          case 'emails': {
            value.forEach((item) => {
              arr.push({ type: item, email_id: obj[item] });
            });
            break;
          }
          case 'phone_numbers': {
            value.forEach((item) => {
              arr.push({ type: item, phone_number: obj[item] });
            });
            break;
          }
        }
        if (arr.length > 0) {
          data[key] = arr;
        }
      } else data[key] = obj[value];

      if (obj.id) data.id = obj.id;
      if (obj.owner.id) data.owner = obj.owner.id;
    }
    return [data, null];
  } catch (err) {
    logger.error('Error while mapping fields: ', err);
    return [null, err.message];
  }
};

const fieldToObjectMap = (fieldMap, data) => {
  try {
    let mappedData = {};
    for (const [key, value] of Object.entries(data)) {
      const mapValue = fieldMap[key];
      if (typeof fieldMap[key] === 'undefined') continue;
      else if (typeof mapValue === 'string' && mapValue.includes('.')) {
        const [parentKey, childKey] = mapValue.split('.');

        if (
          parentKey === 'number_of_employees' ||
          parentKey === 'business_segment'
        )
          mappedData[parentKey] = value;
        if (!mappedData[parentKey]) mappedData[parentKey] = {};

        mappedData[parentKey][childKey] = value;
      } else if (Array.isArray(mapValue)) {
        let [mappedArray, errForMappedArray] = mapValues(mapValue, value);
        if (errForMappedArray) return [null, errForMappedArray];

        Object.assign(mappedData, mappedArray);
      } else mappedData[mapValue] = value;
    }

    return [mappedData, null];
  } catch (err) {
    logger.error('Error while mapping field to object: ', err);
    return [null, err.message];
  }
};

const mapValues = (mapping, data) => {
  try {
    let result = {};

    for (const key in mapping) {
      for (const item of data) {
        if (item.type === mapping[key]) {
          result[mapping[key]] =
            item.phone_number === '' || item.email_id === ''
              ? null
              : item.phone_number || item.email_id;
        }
      }
    }
    return [result, null];
  } catch (err) {
    logger.error('Error while mapping values: ', err);
    return [null, err.message];
  }
};

const separateCustomAndDefaultFields = (data, customFieldsMap) => {
  try {
    let defaultFieldsDate = {};
    let customFieldsData = [];

    for (let i = 0; i < customFieldsMap.length; i++) {
      if (customFieldsMap[i].sellsy_field_id) {
        customFieldsData.push({
          id: customFieldsMap[i].sellsy_field_id,
          value: data[customFieldsMap[i].sellsy_code],
        });
      } else {
        if (customFieldsMap[i].sellsy_code.includes('.')) {
          let [parentKey, childKey] = customFieldsMap[i].sellsy_code.split('.');
          if (
            parentKey === 'number_of_employees' ||
            parentKey === 'business_segment'
          )
            defaultFieldsDate[parentKey] = data[customFieldsMap[i].sellsy_code];
          else
            defaultFieldsDate[parentKey] = {
              ...(defaultFieldsDate[parentKey] || {}),
              [childKey]: data[customFieldsMap[i].sellsy_code],
            };
        } else {
          defaultFieldsDate[customFieldsMap[i].sellsy_code] =
            data[customFieldsMap[i].sellsy_code];
        }
      }
    }

    return [{ defaultFieldsDate, customFieldsData }, null];
  } catch (err) {
    logger.error(
      'Error while separating custom fields and default fields: ',
      err
    );
    return [null, err.message];
  }
};

const fieldMapper = {
  mapSellsyField,
  fieldToObjectMap,
  separateCustomAndDefaultFields,
};

module.exports = fieldMapper;
