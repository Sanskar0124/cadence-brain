//Utils
const logger = require('../../utils/winston');

//Helpers and Services
const GoogleSheets = require('../../services/Google/Google-Sheets');

const bulkLeadDeleteByCadence = async ({ cadence, lead_ids }) => {
  try {
    const googleSheetsFieldMap = cadence?.field_map;
    if (!googleSheetsFieldMap || !cadence.salesforce_cadence_id)
      return [
        null,
        `no google sheet linked with cadence ${cadence.cadence_id}`,
      ];

    //fetch leads from using cadence
    const [
      { rows: gsLeads, sheetInfo: cadenceToStopSheetDetails },
      errForLeads,
    ] = await GoogleSheets.getSheet(
      cadence.salesforce_cadence_id, // id
      0, // sheet index
      true // fetch sheet details
    );
    if (errForLeads) {
      logger.error(
        'Error while fetching leads from google sheets:',
        errForLeads
      );
      return [null, errForLeads];
    }

    const deleteObject = gsLeads
      .filter((gsLead) =>
        lead_ids.some(
          (lead_id) => lead_id == gsLead[googleSheetsFieldMap.lead_id]
        )
      )
      .map((lead) => {
        return {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: lead._rowNumber - 1,
              endIndex: lead._rowNumber,
            },
          },
        };
      })
      .sort((x, y) => {
        const x_weight = x?.deleteDimension?.range?.startIndex || 0;
        const y_weight = y?.deleteDimension?.range?.startIndex || 0;
        return y_weight - x_weight;
      });

    if (deleteObject.length)
      await GoogleSheets.batchDelete({
        spreadsheetId: cadence.salesforce_cadence_id,
        data: deleteObject,
      });
    return [cadence, null];
  } catch (err) {
    logger.error(
      `error while deleting leads for cadence ${cadence.cadence_id}:`,
      err
    );
    return [null, err.message];
  }
};

module.exports = bulkLeadDeleteByCadence;
