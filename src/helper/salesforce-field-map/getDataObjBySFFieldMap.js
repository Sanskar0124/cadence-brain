const { clean } = require('../json');

const getDataObjBySFFieldMap = (sfFieldMap, data) => {
  try {
    if (!sfFieldMap || !data) return [null, 'Fieldmap not found. Please setup fieldmap.'];

    const resultData = {};

    for (const key of Object.keys(sfFieldMap)) {
      let field = sfFieldMap[key];

      if (Array.isArray(field) || !field) continue;
      if (typeof field === 'object') {
        field = field.name;
      }
      resultData[field] = data[key] ?? null;
    }
    console.log('SF field map', sfFieldMap);
    console.log('result data obj', resultData);

    return [clean(resultData), null];
  } catch (err) {
    logger.error(`Error in getDataObjBySFFieldMap: `, err);
    return [null, err.message];
  }
};

module.exports = getDataObjBySFFieldMap;
