//Utils
const logger = require('../../utils/winston');
const { DB_TABLES, DB_MODELS } = require('../../utils/modelEnums');
//Repository
const Repository = require('../../repository');

const getCadenceStepStatistics = async (node_ids, currentTimeUnix) => {
  try {
    const query = `
    
      with nodes as (
        select node_id,cadence_id from node where node_id in ${node_ids}
    ),
    current_leads as (
        SELECT nodes.node_id,
         COUNT(DISTINCT lead.lead_id,CASE
                    WHEN (start_time > :currentTimeUnix OR task.status = 'scheduled')
                    THEN 1
                    ELSE NULL
                END )  AS \`scheduled_count\`, 
                
        COUNT(DISTINCT lead.lead_id,CASE
            WHEN start_time < :currentTimeUnix AND not task.status = 'scheduled'
            THEN 1
            ELSE NULL
        END )  AS \`current_count\`
        
        FROM nodes
                INNER JOIN \`task\` AS \`Task\` on nodes.node_id = \`Task\`.\`node_id\`
                INNER JOIN \`lead\` AS \`Lead\` ON \`Task\`.\`lead_id\` = \`Lead\`.\`lead_id\` AND \`Lead\`.\`status\` IN ('ongoing', 'new_lead') 
                INNER JOIN \`user\` AS \`Lead->User\` ON \`Lead\`.\`user_id\` = \`Lead->User\`.\`user_id\` 
                INNER JOIN \`lead_to_cadence\` AS \`Lead->LeadToCadences\` ON \`Lead\`.\`lead_id\` = \`Lead->LeadToCadences\`.\`lead_id\` AND \`Lead->LeadToCadences\`.\`status\` IN ('in_progress')  AND \`Lead->LeadToCadences\`.\`cadence_id\`=\`Task\`.\`cadence_id\`
                WHERE  \`Task\`.\`status\` IN ("incomplete","scheduled")
                group by nodes.node_id
                
    ),
    completed_and_skipped as (
        
        SELECT  nodes.node_id, 
        COUNT(DISTINCT lead.lead_id,CASE
                    WHEN task.status = "completed"
                    THEN 1
                    ELSE NULL
                END )  AS \`completed_count\`, 
            COUNT(DISTINCT lead.lead_id,CASE
                    WHEN task.status = "skipped"
                    THEN 1
                    ELSE NULL
                END )  AS \`skipped_count\` FROM nodes
                
                INNER JOIN \`task\` AS \`Task\` on nodes.node_id = \`Task\`.\`node_id\`and Task.\`status\` in ("completed" ,"skipped")
                 INNER JOIN \`lead\` AS \`Lead\` ON \`Task\`.\`lead_id\` = \`Lead\`.\`lead_id\`
                 INNER JOIN \`user\` AS \`Lead->User\` ON \`Lead\`.\`user_id\` = \`Lead->User\`.\`user_id\` 
                 group by nodes.node_id
    ),
    
    dq_and_converted as (
      SELECT nodes.node_id, 
      SUM(
      lead.status = "converted")                       
        AS \`converted_count\`
           ,
           SUM(lead.status = "trash")  as \`dq_count\`
      FROM nodes
      INNER JOIN \`lead_to_cadence\` AS \`LeadToCadences\` ON  \`LeadToCadences\`.\`status_node_id\` = nodes.node_id  AND \`LeadToCadences\`.\`cadence_id\`= nodes.cadence_id
      INNER JOIN \`lead\` AS \`Lead\` ON 	\`LeadToCadences\`.\`lead_id\` = \`Lead\`.\`lead_id\` and  \`Lead\`.\`status\` IN ('trash', 'converted')
      INNER JOIN \`user\` AS \`User\` ON \`Lead\`.\`user_id\` = \`User\`.\`user_id\` 
      GROUP BY \`nodes\`.node_id
    ),
    
    paused as (
        SELECT \`nodes\`.node_id, count(\`LeadToCadences\`.\`lead_id\`) AS \`paused_count\` FROM nodes
      
        INNER JOIN \`task\` AS \`Tasks\` on  \`Tasks\`.\`node_id\` = nodes.node_id AND \`Tasks\`.\`status\` = "incomplete"
         INNER JOIN \`lead_to_cadence\` AS \`LeadToCadences\` ON \`Tasks\`.\`lead_id\` = \`LeadToCadences\`.\`lead_id\` AND \`LeadToCadences\`.\`status\` = 'paused' AND \`LeadToCadences\`.\`cadence_id\` = \`Tasks\`.\`cadence_id\`
         group by \`nodes\`.node_id
    ),
    
    final as (
      SELECT 
      nodes.node_id,
      completed_and_skipped.completed_count,
      completed_and_skipped.skipped_count,
      current_leads.scheduled_count, 
      current_leads.current_count,
      dq_and_converted.converted_count,
      dq_and_converted.dq_count,
      paused.paused_count
         FROM nodes
      LEFT JOIN completed_and_skipped on nodes.node_id = completed_and_skipped.node_id
      LEFT JOIN current_leads on nodes.node_id = current_leads.node_id
      LEFT JOIN dq_and_converted on nodes.node_id = dq_and_converted.node_id
      LEFT JOIN paused on nodes.node_id = paused.node_id
    )
    
    select * from final;`;

    let [data, err] = await Repository.runRawQuery({
      rawQuery: query,
      tableName: DB_MODELS[DB_TABLES.NODE],
      replacements: {
        currentTimeUnix,
      },
      extras: {
        // logging: console.log,
      },
    });
    if (err) return [null, err];
    data = JSON.parse(JSON.stringify(data));

    return [data, null];
  } catch (err) {
    logger.error(`Error while fetching cadence step statistics: `, err);
    return [null, err.message];
  }
};

module.exports = getCadenceStepStatistics;
