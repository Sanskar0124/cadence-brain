// Utils
const logger = require('../utils/winston');

// Models
const {
  Cadence,
  Node,
  Task,
  Tag,
  LeadToCadence,
  Lead,
  User,
  Sub_Department,
  Department,
} = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const createCadence = async (cadence) => {
  try {
    const createdCadence = await Cadence.create(cadence);
    logger.info('Cadence: ' + JSON.stringify(createdCadence, null, 4));
    return [createdCadence, null];
  } catch (err) {
    logger.error(`Error while creating cadence: ${err.message}.`);
    return [null, err.message];
  }
};

const getCadence = async (query, attributes = {}) => {
  try {
    // * fetch details for single cadence
    const cadence = await Cadence.findOne({
      where: query,
    });

    // * if no cadence found
    if (!cadence) return [null, 'No cadence found.'];

    return [JsonHelper.parse(cadence), null];
  } catch (err) {
    logger.error(`Error while fetching cadence: ${err.message}`);
    return [null, err.message];
  }
};

const getCadenceWithNodes = async (query) => {
  try {
    // * fetch details for single cadence
    const cadence = await Cadence.findOne({
      where: query,
      include: {
        model: Node,
      },
    });

    return [JsonHelper.parse(cadence), null];
  } catch (err) {
    logger.error(`Error while fetching cadence: ${err.message}`);
    return [null, err.message];
  }
};

const getCadences = async (
  query,
  includeLinkedModel = true,
  attributes = []
) => {
  try {
    let attributesQuery = {};
    if (attributes?.length) {
      attributesQuery.attributes = attributes;
    }
    // * fetch details for multiple cadences
    let cadences;
    if (!includeLinkedModel)
      cadences = await Cadence.findAll({
        where: query,
        ...attributesQuery,
      });
    else
      cadences = await Cadence.findAll({
        where: query,
        ...attributesQuery,
        include: {
          model: Node,
        },
      });

    return [JsonHelper.parse(cadences), null];
  } catch (err) {
    logger.error(`Error while fetching cadences: ${err.message}`);
    return [null, err.message];
  }
};

const getCadencesWithTagAndNodeIds = async (query) => {
  try {
    let cadences = await Cadence.findAll({
      where: query,
      attributes: {
        exclude: [
          'updated_at',
          'inside_sales',
          'salesforce_cadence_id',
          'user_id',
          'end_cadence',
          'integration_type',
        ],
      },
      include: [
        {
          model: Node,
          attributes: ['node_id'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        },
      ],
    });

    return [cadences, null];
  } catch (err) {
    logger.error(`Error while fetching cadences: ${err.message}`);
    return [null, err.message];
  }
};

const updateCadence = async (query, cadence) => {
  try {
    // * update cadences
    const data = await Cadence.update(cadence, {
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while updating cadence: ${err.message}`);
    return [null, err.message];
  }
};

const deleteCadence = async (cadence_id) => {
  try {
    // * delete a cadence
    const data = await Cadence.destroy({
      where: {
        cadence_id,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting cadence: ${err.message}`);
    return [null, err.message];
  }
};

const deleteCadencesByQuery = async (query) => {
  try {
    const data = await Cadence.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting cadence: ${err.message}.`);
    return [null, err.message];
  }
};

const getForCadenceStatistics = async (query) => {
  try {
    const cadence = await Cadence.findOne({
      where: query,
      include: {
        model: Node,
        order: [['step_number']],
        include: Task,
      },
    });

    return [JsonHelper.parse(cadence), null];
  } catch (err) {
    logger.error(
      `Error while fetching for cadence statistics: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getCadenceByUserQuery = async (query) => {
  try {
    const cadence = await Cadence.findAll({
      required: true,
      include: {
        model: LeadToCadence,
        required: true,
        attributes: [],
        include: {
          model: Lead,
          required: true,
          attributes: [],
          include: {
            model: User,
            required: true,
            where: query,
            attributes: [],
          },
        },
      },
      attributes: ['name', 'cadence_id'],
    });
    // console.log(JSON.parse(JSON.stringify(cadence)));
    return [JsonHelper.parse(cadence), null];
  } catch (err) {
    logger.error(`Error while fetching cadence by user query: ${err.message}.`);
    return [null, err.message];
  }
};
// getCadenceByUserQuery(3);

const getAllCadencesForAdminByQuery = async (query) => {
  try {
    const cadences = await Cadence.findAll({
      include: {
        model: Sub_Department,
        include: {
          model: Department,
          where: query,
          attributes: [],
        },
        attributes: [],
      },
      attributes: ['cadence_id', 'name'],
    });

    return [JsonHelper.parse(cadences), null];
  } catch (err) {
    logger.error(
      `Error while fetching cadence for admin by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getNodesForCadenceStatistics = async (query) => {
  try {
    const cadence = await Cadence.findOne({
      where: query,
      include: {
        model: Node,
        order: [['step_number']],
      },
    });

    return [JsonHelper.parse(cadence), null];
  } catch (err) {
    logger.error(
      `Error while fetching for cadence statistics: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getAllCadencesForACompanyWithUser = async (
  cadenceQuery,
  departmentQuery,
  cadenceAttributes = []
) => {
  try {
    let attributesQuery = {};

    if (cadenceAttributes?.length)
      attributesQuery = {
        attributes: cadenceAttributes,
      };

    const cadences = await Cadence.findAll({
      where: cadenceQuery,
      ...attributesQuery,
      include: [
        {
          model: Sub_Department,
          attributes: [],
          include: [
            {
              model: Department,
              where: departmentQuery,
              attributes: [],
            },
          ],
        },
        {
          model: User,
          attributes: ['first_name', 'last_name'],
        },
        {
          model: Node,
          attributes: ['node_id'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        },
      ],
    });

    return [JsonHelper.parse(cadences), null];
  } catch (err) {
    logger.error(
      `Error while fetching cadences for a company with user: `,
      err
    );
    return [null, err.message];
  }
};

const getCadencesByLeadQuery = async (
  cadenceQuery,
  leadQuery,
  cadenceAttributes = [],
  leadAttributes = []
) => {
  try {
    let attributesObject = {};

    if (cadenceAttributes?.length)
      attributesObject.cadence = {
        attributes: cadenceAttributes,
      };
    if (leadAttributes?.length)
      attributesObject.lead = { attributes: leadAttributes };

    const cadences = await Cadence.findAll({
      where: cadenceQuery,
      ...attributesObject.cadence,
      include: [
        {
          model: LeadToCadence,
          required: true,
          attributes: [],
          include: [
            {
              model: Lead,
              where: leadQuery,
              required: true,
              attributes: [],
            },
          ],
        },
      ],
    });

    return [JsonHelper.parse(cadences), null];
  } catch (err) {
    logger.error(`Error while fetching cadence by lead query: `, err);
    return [null, err.message];
  }
};

const getCadencesByCreatedUserQuery = async (
  cadenceQuery,
  userQuery,
  cadenceAttributes,
  userAttributes
) => {
  try {
    let attributesObject = {};

    if (cadenceAttributes)
      attributesObject.cadence = { attributes: cadenceAttributes };
    if (userAttributes) attributesObject.user = { attributes: userAttributes };

    const cadences = await Cadence.findAll({
      where: cadenceQuery,
      ...attributesObject.cadence,
      include: [
        {
          model: User,
          where: userQuery,
          ...attributesObject.user,
        },
      ],
    });

    return [JsonHelper.parse(cadences), null];
  } catch (err) {
    logger.error(`Error while fetching cadences by created user query: `, err);
    return [null, err.message];
  }
};

const CadenceRepository = {
  createCadence,
  getCadence,
  getCadenceWithNodes,
  getCadences,
  getCadencesWithTagAndNodeIds,
  updateCadence,
  deleteCadence,
  deleteCadencesByQuery,
  getForCadenceStatistics,
  getCadenceByUserQuery,
  getAllCadencesForAdminByQuery,
  getNodesForCadenceStatistics,
  getAllCadencesForACompanyWithUser,
  getCadencesByLeadQuery,
  getCadencesByCreatedUserQuery,
};

module.exports = CadenceRepository;
