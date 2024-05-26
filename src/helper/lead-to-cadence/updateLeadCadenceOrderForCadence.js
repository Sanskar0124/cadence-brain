// Utils
const logger = require('../../utils/winston');
const { LEAD_CADENCE_ORDER_MAX } = require('../../utils/constants');

// Repository
const Repository = require('../../repository');

const updateLeadCadenceOrderForCadence = async (cadence_id) => {
  try {
    /**
     * query has 3 parts
     * 1 query generated a table with lead_to_cadence rows which are not paused or stopped and generates a row_number for each row and rows are ordered by created_at
     * 2 query updates the above entries with their row_number as their lead_cadence_order
     * 3 query updates the remaining entries for that cadence which are paused or stopped and updates to MAX_LEAD_CADENCE_ORDER
     * */
    let query = `
WITH ltc_rn AS( 
SELECT ROW_NUMBER() OVER(order by created_at) as rn,lead_cadence_id 
FROM lead_to_cadence ltc where cadence_id = ${cadence_id} and not status in ("paused","stopped")
) 
update 
	lead_to_cadence 
		inner join 
	ltc_rn on ltc_rn.lead_cadence_id=lead_to_cadence .lead_cadence_id 
	set lead_to_cadence.lead_cadence_order = ltc_rn.rn;
update 
	lead_to_cadence 
	set lead_cadence_order = ${LEAD_CADENCE_ORDER_MAX} 
	where cadence_id = ${cadence_id} and status in ("paused","stopped");
		`;

    const [data, err] = await Repository.runRawUpdateQuery({
      rawQuery: query,
    });
    if (err) return [null, err];
    //console.log(data);
    return [true, null];
  } catch (err) {
    logger.error(
      `Error while updating lead cadence order for cadence by raw query: `,
      err
    );
    return [null, err.message];
  }
};

//updateLeadCadenceOrderForCadence(1);

module.exports = updateLeadCadenceOrderForCadence;
