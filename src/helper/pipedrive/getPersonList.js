// * Utils
const logger = require('../../utils/winston');
const { PIPEDRIVE_ENDPOINTS, CRM_INTEGRATIONS } = require('../../utils/enums');

// * Services
const PipedriveService = require('../../services/Pipedrive');

// * gRPC
const v2GrpcClients = require('../../grpc/v2');

const PIPEDRIVE_FILTER_TYPE = {
  person: 'people',
  organization: 'org',
};

const getPersonList = async ({
  resource,
  selectedIds,
  excludedIds,
  userFilter,
  access_token,
  instance_url,
}) => {
  try {
    // * Fetch "ID" Field attribute
    const [{ data: personFields }, errFetchingPersonFields] =
      await v2GrpcClients.crmIntegration.describeObject({
        integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
        integration_data: JSON.stringify({
          object: PIPEDRIVE_ENDPOINTS.PERSON,
          access_token,
          instance_url,
        }),
      });
    if (errFetchingPersonFields) {
      logger.error(`Unable to fetch person fields: `, errFetchingPersonFields);
      return [null, errFetchingPersonFields];
    }

    let idField = personFields?.data?.filter((field) => {
      if (
        field.key === 'id' &&
        field.name === 'ID' &&
        field.edit_flag === false
      )
        return field;
    });
    if (idField.length === 0) return [null, 'Unable to process filter fields'];
    idField = idField[0];

    // * Declaring filter
    let conditions = {
      name: 'Sync Cadence To Ringover Cadence',
      conditions: {
        glue: 'and',
        conditions: [
          {
            glue: 'and',
            conditions: [],
          },
          {
            glue: 'or',
            conditions: [],
          },
        ],
      },
      type: PIPEDRIVE_FILTER_TYPE[resource],
    };

    selectedIds = selectedIds.trim().split(',');
    excludedIds = excludedIds.trim().split(',');

    // * Setting filter
    for (let i = 0; i < excludedIds.length; i++) {
      if (excludedIds[i] === '') continue;
      conditions.conditions.conditions[0].conditions.push({
        object: resource,
        field_id: idField?.id,
        operator: '!=',
        value: excludedIds[i],
        extra_value: null,
      });
    }
    for (let i = 0; i < selectedIds.length; i++) {
      if (selectedIds[i] === '') continue;
      conditions.conditions.conditions[1].conditions.push({
        object: resource,
        field_id: idField?.id,
        operator: '=',
        value: selectedIds[i],
        extra_value: null,
      });
    }

    // * Create filter in Pipedrive
    const [filter, errCreatingPipedriveFilter] =
      await PipedriveService.createFilter({
        access_token,
        instance_url,
        conditions,
      });
    if (errCreatingPipedriveFilter) return [null, errCreatingPipedriveFilter];
    const filter_id = filter.data.id;

    let start = 0,
      limit = 500;

    let user_id = null;
    let user_set_filter_id = null;

    if (userFilter && selectedIds?.[0] === '') {
      user_id = JSON.parse(userFilter).user_id;
      user_set_filter_id = JSON.parse(userFilter)?.filter_id;
    }

    let [person, errForPerson] = await PipedriveService.getAllPersons({
      access_token,
      instance_url,
      filter_id: user_id ? null : user_set_filter_id ?? filter_id,
      user_id,
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
          filter_id: user_id ? null : filter_id,
          user_id,
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

    await PipedriveService.deleteFilter({
      access_token,
      instance_url,
      filter_id,
    });

    return [person, null];
  } catch (err) {
    logger.error(
      `An error occurred while fetching person list from Pipedrive: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  getPersonList,
};
