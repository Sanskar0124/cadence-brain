// ** NOT BEING USED **

// const axios = require('axios');
// const logger = require('../../../utils/winston');
// const fetchCampaignContacts = async (
//   campaign_name,
//   access_token,
//   instance_url
// ) => {
//   try {
//     let URL = `${instance_url}/services/data/v52.0/query?q=SELECT+id,+Account.Id,+Account.Name,+Account.BillingCountry,+Account.OwnerId,+Account.Phone,+Account.Website,+Account.Effectif__c,+Account.Linkedin_Address__c,+Account.BillingPostalCode,+Email,+FirstName,+LastName,+LeadSource,+MobilePhone,+OtherPhone,+Phone,+Title,+OwnerId+FROM+Contact+WHERE+CampaignNameText__c+=%27${campaign_name}%27`;
//     URL = encodeURI(URL);
//     let contacts = [];
//     let { data } = await axios.get(URL, {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//     contacts.push(data.records);
//     if (data.nextRecordsUrl) {
//       URL = `${instance_url}${data.nextRecordsUrl}`;
//       while (true) {
//         let { data } = await axios.get(URL, {
//           headers: {
//             Authorization: `Bearer ${access_token}`,
//           },
//         });
//         contacts.push(data.records);
//         if (data.nextRecordsUrl) URL = `${instance_url}${data.nextRecordsUrl}`;
//         else return [contacts, null];
//       }
//     } else return [contacts, null];
//   } catch (err) {
//     logger.error(`Error while fetching campaign contacts: ${err.message}`);
//     return [null, err.message];
//   }
// };

// module.exports = {
//   fetchCampaignContacts,
// };
