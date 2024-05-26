// * Utils
const logger = require('../../utils/winston');
const { PIPEDRIVE_ENDPOINTS, CRM_INTEGRATIONS } = require('../../utils/enums');

// * Services
const PipedriveService = require('../../services/Pipedrive');

// * gRPC
const v2GrpcClients = require('../../grpc/v2');

const getPersonOfFilter = async ({ filter_id, access_token, instance_url }) => {
  try {
    let start = 0,
      limit = 500;

    let [person, errForPerson] = await PipedriveService.getAllPersons({
      access_token,
      instance_url,
      filter_id,
      start: start,
      limit: limit,
    });
    if (errForPerson) return [null, errForPerson];

    while (person?.additional_data?.pagination?.more_items_in_collection) {
      start += limit;
      let [paginatedPersonData, errForFetchingPaginatedPerson] =
        await PipedriveService.getAllPersons({
          access_token,
          instance_url,
          filter_id,
          start: start,
          limit: limit,
        });
      if (errForFetchingPaginatedPerson)
        return [null, errForFetchingPaginatedPerson];

      person.data.push(...paginatedPersonData.data);
      person.additional_data.pagination.more_items_in_collection =
        paginatedPersonData.additional_data.pagination.more_items_in_collection;
      person.additional_data.pagination.limit +=
        paginatedPersonData.additional_data.pagination.limit;
    }

    return [person, null];
  } catch (err) {
    logger.error(
      `An error occurred while fetching person list from Pipedrive filters: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  getPersonOfFilter,
};
