// Utils
const logger = require('../../utils/winston');
const { DB_MODELS, DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { QueryTypes } = require('sequelize');

// Helpers and Services
const Repository = require('../../repository');

const createActivityForDeletedNodesWithNoNextNodes = async ({
  cadence_id,
  activity_name,
  activity_status,
  activity_type,
  node_ids = [],
  t,
}) => {
  try {
    // TODO: remove once feature is stable
    logger.info(
      'in activity for deleted nodes with no next nodes remaining leads'
    );

    let query = `

insert into activity(name,status,type,lead_id,cadence_id,created_at,updated_at)
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
-- select * from leads
select 
:activity_name as name,
:activity_status as status,
:activity_type as type,
lead_id,
:cadence_id as cadence_id, 
now() as created_at ,
now() as updated_at 
from leads


		`;

    const [data, err] = await Repository.runRawQuery({
      rawQuery: query,
      tableName: DB_MODELS[DB_TABLES.ACTIVITY],
      replacements: {
        cadence_id,
        activity_type,
        activity_name,
        activity_status,
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
    console.log('createActivityForDeletedNodesWithNoNextNodes ', data, err);
    return [data, null];
  } catch (err) {
    logger.error(
      `Error while creating activity for leads having tasks for deleted nodes with no next node id by raw query: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = createActivityForDeletedNodesWithNoNextNodes;
