// Utils
const logger = require('../../utils/winston');
const { DB_MODELS, DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { QueryTypes } = require('sequelize');

// Helpers and Services
const Repository = require('../../repository');

const createActivityForLaunchResumeLeads = async ({
  cadence_id,
  activity_name,
  activity_status,
  activity_type,
  t,
}) => {
  try {
    let query = `

insert into activity(name,status,type,lead_id,cadence_id,created_at,updated_at)

with in_progress_leads as
(
select 
ltc.lead_id,
l.user_id,
CONCAT(u.first_name," ",u.last_name) as user
from lead_to_cadence ltc
inner join \`lead\` l on l.lead_id = ltc.lead_id
inner join \`user\` u on l.user_id = u.user_id 
where cadence_id = :cadence_id  and ltc.status = 'in_progress'
)

select 
:name as name,
:status as status,
:type as type,
lead_id,
:cadence_id as cadence_id,
now() as created_at,
now() as updated_at
from in_progress_leads


		`;

    const [data, err] = await Repository.runRawQuery({
      rawQuery: query,
      tableName: DB_MODELS[DB_TABLES.ACTIVITY],
      replacements: {
        cadence_id,
        name: activity_name,
        status: activity_status,
        type: activity_type,
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
      `Error while creating activity for launch resume leads by raw query: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = createActivityForLaunchResumeLeads;
