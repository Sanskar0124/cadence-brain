// Utils
const logger = require('../../utils/winston');

// Helpers and Services
const LushaService = require('../../services/Lusha');
const KasprService = require('../../services/Kaspr');
const seperatePhoneNumbers = require('./seperatePhoneNumbers');

const fetchPhoneNumbers = async ({ lead, LUSHA_API_KEY, KASPR_API_KEY }) => {
  try {
    let data = {
      phone: '',
      mobilePhone: '',
      lushaEmails: [],
      kasprEmails: [],
    };

    const [lushaData, _] = await LushaService.fetchLushaData({
      lusha_api_key: LUSHA_API_KEY,
      first_name: lead.firstName,
      last_name: lead.lastName,
      linkedin_url: lead.linkedinUrl,
      account_name: lead?.companyName,
    });

    data.lushaEmails = lushaData?.emailAddresses || [];

    let lushaPhoneNumbers = [];

    if (lushaData?.phoneNumbers?.length > 0)
      lushaData.phoneNumbers.forEach((numberObj) =>
        lushaPhoneNumbers.push(numberObj.internationalNumber)
      );

    const lushaPhoneNumbersString = lushaPhoneNumbers.join(',');
    console.log(lushaPhoneNumbersString);
    const [seperatedLushaPhoneNumbers, errForSeperatedLushaPhoneNumbers] =
      await seperatePhoneNumbers(lushaPhoneNumbersString);

    console.log(seperatedLushaPhoneNumbers);

    if (
      !seperatedLushaPhoneNumbers?.phone ||
      !seperatedLushaPhoneNumbers?.mobilePhone
    ) {
      const [kasprData, errForKasprData] = await KasprService.fetchKasprData({
        first_name: lead.firstName,
        last_name: lead.lastName,
        linkedin_url: lead.linkedinUrl,
        kaspr_api_key: KASPR_API_KEY,
      });
      let kasprPhoneNumbers = [];

      // console.log(`KASPR DATA: `, kasprData);

      // console.log(`KASPR EMAILS: `, kasprData.profile.emails);

      data.kasprEmails = kasprData?.profile?.emails || [];

      if (kasprData?.profile?.phones?.length > 0)
        kasprPhoneNumbers = kasprData.profile.phones;

      const kasprPhoneNumbersString = kasprPhoneNumbers.join(',');

      const [seperatedKasprPhoneNumbers, errForSeperatedKasprPhoneNumbers] =
        await seperatePhoneNumbers(kasprPhoneNumbersString);
      console.log(seperatedKasprPhoneNumbers);

      data = {
        ...data,
        phone:
          seperatedLushaPhoneNumbers?.phone ||
          seperatedKasprPhoneNumbers?.phone ||
          seperatedLushaPhoneNumbers?.homePhone ||
          seperatedKasprPhoneNumbers?.homePhone ||
          '',
        mobilePhone:
          seperatedLushaPhoneNumbers?.mobilePhone ||
          seperatedKasprPhoneNumbers?.mobilePhone ||
          seperatedLushaPhoneNumbers?.otherPhone ||
          seperatedKasprPhoneNumbers?.otherPhone ||
          '',
      };
    }

    return [data, null];
  } catch (err) {
    logger.error(`Error while fetching phone numbers: `, err);
    return [null, err.message];
  }
};

module.exports = fetchPhoneNumbers;
