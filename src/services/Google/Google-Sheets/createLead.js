const loadDocument = require('./loadDocument');
const logger = require('../../../utils/winston');

const createLead = async ({ lead, doc_id }) => {
  const [doc, errForDoc] = await loadDocument(doc_id);
  if (errForDoc) return [null, errForDoc];
  const sheet = doc.sheetsByIndex[0];
  try {
    const row = await sheet.addRow(lead);
    await row.save();
    lead.id = row._rowNumber;
    return [lead, null];
  } catch (err) {
    logger.error('Error adding tuple in sheet', err);
    return [null, `Error adding tuple in sheet : ${err.message}`];
  }
};

module.exports = createLead;
