// Utils
const logger = require('../../utils/winston');
const { DB_MODELS, DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { QueryTypes } = require('sequelize');

// Helpers and Services
const Repository = require('../../repository');

const updateLeadToCadenceForDeletedNodesWithNoNextNodes = async ({
  cadence_id,
  status,
  node_ids = [],
  t,
}) => {
  try {
    // TODO: remove once feature is stable
    console.log(
      'in update lead_to_cadence status for deleted nodes with no next nodes remaining leads'
    );

    let query = `

with leads as 
(
select 
t.lead_id
-- t.*,
-- n.node_id as \`n.node_id\`,
-- n.type,
-- n.name as \`n.node_name\`,
-- n.next_node_id,
-- n.step_number 
from 
task t
left outer join node n on t.node_id = n.node_id  
where 
t.cadence_id = :cadence_id and 
t.node_id in (:node_ids) and
t.is_skipped=0 and
t.completed =0 and
n.node_id is null
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
        status,
        node_ids,
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
    console.log(
      'updateLeadToCadenceForDeletedNodesWithNoNextNodes ',
      data,
      err
    );
    return [data, null];
  } catch (err) {
    logger.error(
      `Error while updating lead to cadence status for leads having tasks for deleted nodes with no next node id by raw query: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = updateLeadToCadenceForDeletedNodesWithNoNextNodes;
