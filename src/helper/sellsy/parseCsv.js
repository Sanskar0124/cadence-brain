// Utils
const logger = require('../../utils/winston');

// Packages
const xlsx = require('xlsx');

const parseCsv = ({ file, fieldMap, limit = 501 }) => {
  return new Promise((resolve, reject) => {
    try {
      let contacts = [];

      let companyContactRelation = {};
      const workbook = xlsx.readFile(file, { sheetRows: limit });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const options = {
        blankrows: false,
        defval: '',
        raw: false,
        rawNumbers: false,
      };

      let workbook_response = xlsx.utils.sheet_to_json(worksheet, options);

      // process data
      workbook_response.forEach((row) => {
        let contact = {};
        let emails = [];
        let phone_numbers = [];
        let isEmpty = true;

        Object.keys(fieldMap)?.forEach((key) => {
          if (key !== 'emails' && key !== 'phone_numbers') {
            contact[key] = row[fieldMap[key]]?.trim() ?? null;
            if (contact[key]?.length) isEmpty = false;
          }
        });
        fieldMap?.phone_numbers?.forEach((phone_number) => {
          const phone = row[phone_number.column_name]?.trim() ?? null;
          phone_numbers.push({
            phone_number: phone,
            type: phone_number.type,
          });
          if (phone?.length) isEmpty = false;
        });
        fieldMap?.emails?.forEach((email) => {
          const mail = row[email.column_name]?.trim() ?? null;
          emails.push({
            email_id: mail,
            type: email.type,
          });
          if (mail?.length) isEmpty = false;
        });

        contact.emails = emails;
        contact.phone_numbers = phone_numbers;
        if (isEmpty) return;
        contact.account = {
          name: contact?.company_name?.split(',')[0],
        };
        delete contact?.company_name;
        contacts.push(contact);

        if (contact.account?.name) {
          if (companyContactRelation[contact.account?.name])
            companyContactRelation[contact.account?.name].push(contact?.id);
          else companyContactRelation[contact.account?.name] = [contact?.id];
        }
      });

      resolve([{ contacts, companyContactRelation }, null]);
    } catch (err) {
      logger.error(`Error while getting values from redis: `, err);
      resolve([null, err.message]);
    }
  });
};

module.exports = parseCsv;
