//Utils
const logger = require('../../../utils/winston');

//Helpers and Services
const loadDocument = require('./loadDocument');

const getSheet = async (id, index = 0, getSheetName = false, limit = 1000) => {
  try {
    const [doc, errForDoc] = await loadDocument(id);
    if (errForDoc) {
      if (getSheetName) return [{ rows: null, sheetInfo: null }, errForDoc];
      else return [null, errForDoc];
    }
    const sheet = doc.sheetsByIndex[index];
    //await sheet.loadCells();
    //console.log(sheet);
    //console.log(sheet._rawProperties.title);
    //return;
    const rows = await sheet.getRows({
      limit,
    });
    //console.log(rows);
    //let data = [];
    //let i = 0;
    //while (true) {
    //if (i >= rows.length) break;
    //let row = rows[i];
    //// [{userEnteredValue: ''},{},{}]
    //row['Company Phone'] = 123;
    ////console.log(row);
    ////console.log(row._rawData.length);
    ////console.log(row._rawProperties.gridProperties);
    //data.push({
    //updateCells: {
    //range: {
    //sheetId: 0,
    //startRowIndex: row._rowNumber,
    //startColumnIndex: 0,
    //},
    //rows: [{ values: { userEnteredValue: 123 } }],
    //fields: ['Company Phone'],
    //},
    //});

    //i++;
    //}
    //doc._makeBatchUpdateRequest([data]);
    let result = rows;
    if (getSheetName)
      result = { rows, sheetInfo: { name: sheet._rawProperties.title } };
    //console.log(result);
    return [result, null];
  } catch (err) {
    logger.error('Error while getting google sheet:', err);
    if (getSheetName) return [{ rows: null, sheetInfo: null }, err.message];
    else return [null, err.message];
  }
};

//getSheet('1RnsFz1JLyK4zzFm_EXVuNEYx11dZR-m0HHYxQbu5qAs');

module.exports = getSheet;
