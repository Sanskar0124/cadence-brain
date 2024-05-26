// Utils
const logger = require('../../utils/winston');
const { DB_MODELS, DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { QueryTypes } = require('sequelize');

// Helpers and Services
const Repository = require('../../repository');

const updateLeadToCadenceForCompletedLeads = async ({
  cadence_id,
  created_timestamp,
  status,
  t,
}) => {
  try {
    // TODO: remove once feature is stable
    console.log('in update lead_to_cadence status for completed leads');

    let query = `

with leads as 
(
select 
t.lead_id
-- t.*,
-- json_extract(t.metadata,"$.created_timestamp"),
-- n.node_id as \`n.node_id\`,
-- n.type,
-- n.name as \`n.node_name\`,
-- n.next_node_id,
-- n.step_number 
from 
task t
inner join node n on t.node_id = n.node_id  
where 
t.cadence_id = :cadence_id and
json_extract(t.metadata,"$.created_timestamp") = :created_timestamp and  
t.is_skipped=1 and
n.next_node_id is null
group by t.lead_id
)
update
lead_to_cadence 
inner join leads on leads.lead_id = lead_to_cadence.lead_id  and lead_to_cadence.cadence_id = :cadence_id  
set status = :status;


		`;

    const [data, err] = await Repository.runRawQuery({
      rawQuery: query,
      tableName: DB_MODELS[DB_TABLES.LEADTOCADENCE],
      replacements: {
        cadence_id,
        created_timestamp,
        status,
      },
      include: [],

      extras: {
        mycustom: true,
        type: QueryTypes.INSERT,
        returning: true,
      },
      t,
    });

    // TODO: remove once feature is stable
    console.log(data, err);
    return [data, null];
  } catch (err) {
    logger.error(
      `Error while updating lead to cadence status for completed leads by raw query: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = updateLeadToCadenceForCompletedLeads;
