// Utils
const logger = require('../../../utils/winston');
const { LINKEDIN_PEOPLE_REGEX } = require('../../../utils/constants');
const {
  SNOV_ID,
  SNOV_SECRET,
  HUNTER_KEY,
  LUSHA_API_KEY,
  KASPR_API_KEY,
} = require('../../../utils/config');

// Packages
const axios = require('axios');

// Helpers and services
const fetchPeopleDetails = require('./fetchPeopleDetails');
const EmailHelper = require('../../../helper/email');
const PhoneNumberHelper = require('../../../helper/phone-number');
const SocketHelper = require('../../../helper/socket');
const RedisHelper = require('../../../helper/redis');
const searchPeople = require('./searchPeople');
const salesNavSearchPeople = require('./salesNavSearchPeople');

const fetchProfilesFromSearchUrl = async ({
  searchUrl,
  headers,
  user_id,
  profile_limit,
  loaderId,
}) => {
  try {
    let results = [];
    let pageCount = 0;
    let noResult = 0;
    let profilesProcessed = 0;
    const CONCURRENCY_LIMIT = 10;
    let QueryRateLimited = false;
    const fetchAndExportProfilePromises = new Set();
    const runningPromises = new Set();

    // console.log({
    //   SNOV_ID,
    //   SNOV_SECRET,
    //   HUNTER_KEY,
    //   LUSHA_API_KEY,
    //   KASPR_API_KEY,
    // });
    //const { SNOV_ID, SNOV_SECRET, HUNTER_KEY, LUSHA_API_KEY, KASPR_API_KEY } =
    //tokens;

    while (profilesProcessed < profile_limit) {
      let entityUrns, errForEntityUrns;
      if (searchUrl.includes('/sales/search/people'))
        [entityUrns, errForEntityUrns] = await salesNavSearchPeople({
          search_url: searchUrl,
          headers,
          count: 10,
          offset: pageCount * 10,
        });
      else
        [entityUrns, errForEntityUrns] = await searchPeople({
          headers,
          limit: 10,
          offset: pageCount * 10,
          search_url: searchUrl,
        });

      if (errForEntityUrns) return [null, errForEntityUrns];

      console.log(entityUrns);
      entityUrns = [...new Set(entityUrns)];

      if (!entityUrns.length) noResult += 1;
      if (noResult > 2) break;

      for (let entityUrn of entityUrns) {
        if (profilesProcessed < profile_limit && !QueryRateLimited) {
          fetchAndExportProfilePromises.add(
            fetchPeopleDetails(entityUrn, headers)
          );
          profilesProcessed++;
        }
      }

      while (
        fetchAndExportProfilePromises.size > 0 &&
        runningPromises.size < CONCURRENCY_LIMIT
      ) {
        const profilePromise = fetchAndExportProfilePromises
          .values()
          .next().value;
        runningPromises.add(profilePromise);
        fetchAndExportProfilePromises.delete(profilePromise);
      }
      try {
        const settledPromises = await Promise.allSettled(runningPromises);
        for (let promise of settledPromises) {
          if (promise.status === 'fulfilled') {
            const [profileDetail, errForProfileDetail] = promise.value;
            if (errForProfileDetail) {
              profilesProcessed--;
              continue;
            }
            /*
        // fetch valid email from snov
        const [validEmail, errForValidEmail] =
          await EmailHelper.fetchValidEmails({
            lead: profileDetails,
            SNOV_ID,
            SNOV_SECRET,
            HUNTER_KEY,
          });

        if (validEmail) profileDetails.email = validEmail;
        else {
          profileDetails.email = '';
          logger.info(`No email found.`);
          continue;
          //return serverErrorResponse(
          //res,
          //`Cannot proceed further since no email found for profile.`
          //);
        }

        const [phoneNumbers, errForPhoneNumbers] =
          await PhoneNumberHelper.fetchPhoneNumbers({
            lead: profileDetails,
            LUSHA_API_KEY,
            KASPR_API_KEY,
          });

        if (phoneNumbers?.phone || phoneNumbers?.mobilePhone) {
          logger.info(`Phone number found.`);
          profileDetails.phone = phoneNumbers.phone;
          profileDetails.mobilePhone = phoneNumbers.mobilePhone;
        } else {
          logger.info(`Phone number not found.`);
          continue;
          //return badRequestResponse(
          //res,
          //`Cannot proceed further since no phone number found for profile.`
          //);
        }
*/
            results.push(profileDetail);
            SocketHelper.sendCadenceImportLoaderEvent({
              loaderData: {
                index: results.length,
                size: profile_limit,
              },
              socketId: loaderId,
            });

            await RedisHelper.appendValueToArray(
              `ProfilesArray_${user_id}_${searchUrl}`,
              profileDetail
            );
          } else {
            profilesProcessed--;
            logger.error(
              'error while fetching profile detail:',
              promise.reason
            );
          }

          runningPromises.delete(promise);
        }
      } catch (error) {
        logger.error(`error while processing batch No. ${pageCount} :`, error);
      }
      runningPromises.clear();
      pageCount++;
    }
    return [results, null];
  } catch (error) {
    logger.error('error while fetching profiles from url', error);
    return [null, error.message];
  }
};

module.exports = fetchProfilesFromSearchUrl;
