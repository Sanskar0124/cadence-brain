// Utils
const logger = require('../utils/winston');
const { AGENDA_FILTERS } = require('../utils/enums');

// Models
const { Op } = require('sequelize');
const { Agenda, Lead } = require('../db/models');

// Helpers and services
const { getDate } = require('../helper/agendas/agendas.helper');

const createAgenda = async (agenda) => {
  try {
    const createdAgenda = await Agenda.create(agenda);
    // logger.info('Added :-');
    // logger.info(JSON.stringify(createdAgenda, null, 2));
    return [JSON.parse(JSON.stringify(createdAgenda)), null];
  } catch (err) {
    logger.error(err.message);
    if (err.errors[0].message.includes('must be unique')) return [true, null];
    return [null, err.message]; // for database error
  }
};

const getAgendasByQuery = async (query) => {
  try {
    const agendas = await Agenda.findAll({
      where: query,
    });
    return [agendas, null];
  } catch (err) {
    logger.error(err.message);
    return [null, err.message]; // for database error
  }
};

const getPendingAgendas = async (user_id) => {
  try {
    const agendas = await Agenda.findAll({
      where: {
        completed: false,
      },
      include: {
        model: Lead,
        where: {
          user_id: user_id,
        },
        attributes: [],
      },
      order: ['scheduled', 'ASC'],
    });
    return [agendas, null];
  } catch (err) {
    console.log(err);
    logger.error(err.message);
    return [null, err];
  }
};

const updateAgenda = async (agenda) => {
  try {
    const data = await Agenda.update(agenda, {
      where: {
        agenda_id: agenda.agenda_id,
      },
    });
    return [data, null];
  } catch (err) {
    console.log(err);
    logger.error(err.message);
    return [null, err.message]; // for database error
  }
};

const deleteAgenda = async (agenda_id) => {
  try {
    const data = await Agenda.destroy({
      where: {
        agenda_id: agenda_id,
      },
    });
    global.io.emit('deleteAgenda');
    return [data, null];
  } catch (err) {
    logger.error(err.message);
    return [null, err];
  }
};

const deleteEventAgenda = async (event_id) => {
  try {
    const data = await Agenda.destroy({
      where: {
        google_event_id: event_id,
      },
    });
    global.io.emit('deleteAgenda');
    return [data, null];
  } catch (err) {
    logger.error(err.message);
    return;
  }
};

const getAgendaByQuery = async (query) => {
  try {
    const agenda = await Agenda.findOne({
      where: query,
    });
    return [agenda, null];
  } catch (err) {
    logger.error(`Error while fetching agendas by query: ${err.message}.`);
    return [null, err.message];
  }
};

const dateFiltersForAgendas = {
  [AGENDA_FILTERS.TODAY]: (timezone) => getDate({ after: 0, timezone }),
  [AGENDA_FILTERS.TOMMORROW]: (timezone) => getDate({ after: 1, timezone }),
  [AGENDA_FILTERS.THIS_WEEK]: (timezone) =>
    getDate({ week: AGENDA_FILTERS.THIS_WEEK, timezone }),
  [AGENDA_FILTERS.NEXT_WEEK]: (timezone) =>
    getDate({ week: AGENDA_FILTERS.NEXT_WEEK, timezone }),
  [AGENDA_FILTERS.COMPLETED]: { completed: 1 },
};

const filterAgendas = async (filter, user_id, timezone) => {
  try {
    let filteredAgendas = [];

    if (!dateFiltersForAgendas[filter]) return [null, 'Invalid Filter.'];

    let where = {};

    if (filter === AGENDA_FILTERS.COMPLETED) {
      where = {
        completed: 1,
      };
    } else {
      where = {
        scheduled: {
          [Op.between]: dateFiltersForAgendas[filter](timezone),
        },
        completed: false,
      };
    }

    // * get agendas for user
    filteredAgendas = await Agenda.findAll({
      where: {
        ...where,
        user_id,
      },
      order: [['scheduled', 'ASC']],
    });

    // // ==== FETCHING AGENDAS WITH SPECIFIC USER ID ====

    // filteredAgendas = [
    //   ...filteredAgendas,
    //   ...(await Agenda.findAll({
    //     where: { ...where, user_id: user_id },
    //     order: [['scheduled', 'ASC']],
    //   })),
    // ];

    // // Filtering all agendas
    // let foundAgendaIds = [];
    // let finalAgendaList = [];
    // for (var i = 0; i < filteredAgendas.length; i++) {
    //   if (!foundAgendaIds.includes(filteredAgendas[i].dataValues.agenda_id)) {
    //     foundAgendaIds.push(filteredAgendas[i].dataValues.agenda_id);
    //     finalAgendaList.push(filteredAgendas[i]);
    //   }
    // }
    // function compare(a, b) {
    //   if (a.scheduled < b.scheduled) {
    //     return -1;
    //   }
    //   if (a.scheduled > b.scheduled) {
    //     return 1;
    //   }
    //   return 0;
    // }

    // finalAgendaList = finalAgendaList.sort(compare);
    // // ==== END OF FILTERING AGENDAS WITH SPECIFIC USER ID ====
    return [filteredAgendas, null];
  } catch (err) {
    console.log(err);
    logger.error(err.message);
    return [null, err];
  }
};

const deleteEventRecurringAgenda = async (event_id) => {
  try {
    const data = await Agenda.destroy({
      where: {
        recurring_event_Id: event_id,
      },
    });
    global.io.emit('deleteAgenda');
    return [data, null];
  } catch (err) {
    logger.error(err.message);
    return;
  }
};

const deleteAgendaByUserId = async (user_id) => {
  try {
    const data = await Agenda.destroy({
      where: {
        user_id: user_id,
      },
    });
    //   global.io.emit('deleteAgenda');
    return [data, null];
  } catch (err) {
    logger.error(err.message);
    return [null, err];
  }
};

const AgendaRepository = {
  createAgenda,
  getAgendasByQuery,
  getPendingAgendas,
  updateAgenda,
  deleteAgenda,
  filterAgendas,
  deleteEventAgenda,
  getAgendaByQuery,
  deleteEventRecurringAgenda,
  deleteAgendaByUserId,
};

module.exports = AgendaRepository;
