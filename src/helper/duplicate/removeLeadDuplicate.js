// Utils
const logger = require('../../utils/winston');

// Repositories
const LeadRepository = require('../../repository/lead.repository');
const StatusRepository = require('../../repository/status.repository');
const EmailRepository = require('../../repository/email.repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const TaskRepository = require('../../repository/task.repository');
const LeadPhoneNumberRepository = require('../../repository/lead-pn.repository');
const LeadEmailRepository = require('../../repository/lead-em.repository');
const ActivityRepository = require('../../repository/activity.repository');

const removeLeadDuplicate = async () => {
  try {
    logger.info('Removing lead duplicate.');
    let [leads, errForLeads] =
      await LeadRepository.getDuplicateBySalesforceLeadIdCount();
    if (errForLeads);
    if (leads.length === 0) return;

    let i = 0;
    while (i < leads.length) {
      let lead = leads[i];
      const [leadsss, errForOtherLeads] = await LeadRepository.getLeadsByQuery({
        salesforce_lead_id: lead.salesforce_lead_id,
      });
      let lead_id;

      if (leadsss[0].lead_id > leadsss[1].lead_id) lead_id = leadsss[0].lead_id;
      else lead_id = leadsss[1].lead_id;

      console.log('Lead-Id:', lead.lead_id);
      await LeadRepository.deleteLead(lead_id);
      await StatusRepository.deleteStatuses(lead_id);
      await EmailRepository.deleteEmailsByQuery({ lead_id });
      await LeadToCadenceRepository.deleteLeadToCadenceLink({
        lead_id,
      });
      await TaskRepository.deleteTasksByQuery({ lead_id });
      await LeadPhoneNumberRepository.deleteLeadPhoneNumbers({ lead_id });
      await LeadEmailRepository.deleteLeadEmail({ lead_id });
      await ActivityRepository.deleteActivity({ lead_id });
      i++;
      console.log('i:', i);
      if (i === leads.length) return;
    }
  } catch (err) {
    console.log(err);
    logger.error(
      `Error while removing duplicates from cadence: ${err.message}.`
    );
    return;
  }
};

module.exports = removeLeadDuplicate;
