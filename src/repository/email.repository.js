// Utils
const logger = require('../utils/winston');

// Packages

const moment = require('moment');
const parser = require('node-html-parser');
const { Op } = require('sequelize');

// Helpers and services
const JsonHelper = require('../helper/json');

// Models
const { Email, Lead, sequelize, Cadence, User } = require('../db/models');

const saveSent = async (user_id, lead_id, sentEmails) => {
  console.log(sentEmails[0]);
  try {
    await Email.bulkCreate(
      sentEmails.map((email) => ({
        user_id,
        lead_id,
        message_id: email.id,
        thread_id: email.threadId,
        sent: true,
      }))
    );
    return [true, null];
  } catch (err) {
    logger.error(`Error while creating sent mails: ${err.message}`);
    return [null, err.message];
  }
};

const saveReceived = async (user_id, lead_id, receivedEmails) => {
  try {
    await Email.bulkCreate(
      receivedEmails.map((email) => ({
        user_id,
        lead_id,
        message_id: email.id,
        thread_id: email.threadId,
        sent: false,
      }))
    );
    return [true, null];
  } catch (err) {
    logger.error(`Error while creating received mails: ${err.message}`);
    return [null, err.message];
  }
};

const getReceived = async (user_id, lead_id) => {
  try {
    const template = await Email.findAll({
      where: {
        user_id,
        lead_id,
        sent: false,
      },
      attributes: ['email_json'],
    });
    return [template.map((t) => JSON.parse(t.email_json)), null];
  } catch (err) {
    logger.error(`Error while getting received mails: ${err.message}`);
    return [null, err.message];
  }
};

const getSent = async (user_id, lead_id) => {
  try {
    const template = await Email.findAll({
      where: {
        user_id,
        lead_id,
        sent: true,
      },
      attributes: ['email_json'],
    });
    return [template.map((t) => JSON.parse(t.email_json)), null];
  } catch (err) {
    logger.error(`Error while getting sent mails: ${err.message}`);
    return [null, err.message];
  }
};

const deleteByMessageId = async (message_id) => {
  try {
    await Email.destroy({
      where: {
        message_id,
      },
    });
    return [true, null];
  } catch (err) {
    logger.error(`Error while deleting mail by message id: ${err.message}`);
    return [null, err.message];
  }
};

const upsert = async (
  user_id,
  lead_id,
  mail,
  cadence_id,
  node_id,
  et_id,
  is_replied_mail = false
) => {
  try {
    // email mail.textHtml contains tracking_image_id inside src of img tag, extract using regex
    // check for hidden- in email.mail.textHtml

    // console.log(
    //   'parsedSrc',
    //   parser.parse(email.mail.textHtml).querySelector('#lead_to_cadence')._attrs.src
    // );
    let image_id_from_parser, tracking_image_id;
    try {
      if (mail.textHtml) {
        image_id_from_parser = parser
          .parse(mail.textHtml)
          .querySelector('#lead_to_cadence')?._attrs?.src;
        if (
          !image_id_from_parser ||
          image_id_from_parser === 'null' ||
          image_id_from_parser === 'undefined'
        )
          image_id_from_parser = null;
      } else image_id_from_parser = null;
    } catch (e) {
      logger.error(`Error while parsing email:`, e);
      image_id_from_parser = null;
    }

    if (!et_id) {
      try {
        et_id =
          parser
            .parse(mail.textHtml)
            .querySelector('#lead_to_cadence')
            ?.getAttribute('data-et_id') ?? null;

        if (!et_id || et_id === 'null' || et_id === 'undefined') et_id = null;
        else et_id = parseInt(et_id);
      } catch (e) {
        logger.error(`Error while parsing email: ${e.message}`);
        et_id = null;
      }
    }
    if (image_id_from_parser)
      tracking_image_id = image_id_from_parser.split('hidden-')[1];
    else tracking_image_id = null;

    const em = await Email.upsert({
      user_id,
      lead_id,
      message_id: mail.id,
      thread_id: mail.thread_id,
      tracking_image_id,
      sent: mail.sent,
      cadence_id,
      node_id,
      et_id: isNaN(et_id) ? null : et_id,
      is_replied_mail,
    });
    return [em, null];
  } catch (err) {
    logger.error(`Error while upserting mail: ${err.message}`);
    return [null, err.message];
  }
};

const get = async (message_id) => {
  try {
    const email = await Email.findOne({
      where: {
        message_id: message_id,
      },
    });
    return [email, null];
  } catch (err) {
    logger.error(`Error while fetching mail from db: ${err.message}`);
    return [null, err.message];
  }
};

const update = async (whereObj, email) => {
  try {
    const em = await Email.update(email, {
      where: whereObj,
    });
    return [em, null];
  } catch (err) {
    logger.error(`Error while updating mail: ${err.message}`);
    return [null, err.message];
  }
};

const createDummyEmail = async (messageId, threadId, userId, leadId) => {
  try {
    var t = {
      // create a dummy email
      message_id: messageId,
      thread_id: threadId,
      user_id: userId,
      lead_id: leadId,
    };
    logger.info('\n', t);
    var data = await Email.create({
      // create a dummy email
      message_id: messageId,
      thread_id: threadId,
      user_id: userId,
      lead_id: leadId,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while creating dummy email: ${err.message}`);
    return [null, err.message];
  }
};

const getSentEmailByThreadId = async (threadId) => {
  try {
    const email = await Email.findOne({
      where: {
        thread_id: threadId,
        sent: true,
      },
      include: [Lead],
    });
    return [email, null];
  } catch (err) {
    logger.error(`Error while fetching mail from db: ${err.message}`);
    return [null, err.message];
  }
};

const deleteEmailsByQuery = async (query) => {
  try {
    const data = await Email.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting emails by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getEmailsByQuery = async (query) => {
  try {
    const data = await Email.findAll({
      where: query,
    });
    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching emails by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getEmailByQuery = async (query) => {
  try {
    const data = await Email.findOne({
      where: query,
    });
    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching emails by query: ${err.message}.`);
    return [null, err.message];
  }
};

// Cadence Activity

const getEmailStatusCountForUserAndCadence = async ({
  user_id,
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const data = await Email.findAll({
      where: {
        user_id: user_id ?? { [Op.ne]: null },
        cadence_id: cadence_id ?? { [Op.ne]: null },
        sent: true,
        created_at: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            end_date ??
              moment(new Date(3000, 3, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
          ],
        },
      },
      include: {
        model: Cadence,
        attributes: ['name'],
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('email.status')), 'count'],
        'cadence_id',
        [sequelize.col('Cadence.name'), 'name'],
      ],
      group: ['cadence_id', 'status'],
      // raw:true,
    });
    // console.log(JsonHelper.parse(data));
    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error(`Error while getting email status count: ${err.message}.`);
    return [null, err.message];
  }
};

// getEmailStatusCountForUserAndCadence(null, [178]);
// getEmailStatusCountForUserAndCadence({
//   user_id: ['3'],
// });

const getEmailStatusCountForGroupAndCadence = async ({
  sd_id,
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const data = await Email.findAll({
      where: {
        cadence_id: cadence_id ?? { [Op.ne]: null },
        sent: true,
        created_at: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            end_date ??
              moment(new Date(3000, 3, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
          ],
        },
      },
      include: [
        {
          model: Cadence,
          attributes: ['name'],
          where: {
            name: {
              [Op.ne]: null,
            },
          },
        },
        {
          model: User,
          attributes: [],
          where: {
            sd_id: sd_id,
          },
        },
      ],
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('email.status')), 'count'],
        'cadence_id',
        [sequelize.col('Cadence.name'), 'name'],
      ],
      group: ['cadence_id', 'status'],
      // raw:true,
    });
    // console.log(JsonHelper.parse(data));
    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error(`Error while getting email status count: `, err);
    return [null, err.message];
  }
};
// getEmailStatusCountForGroupAndCadence({
//   sd_id: '4192bff0-e1e0-43ce-a4db-912808c32495',
// });
// Cadence step performing analyse

const getEmailStatusCountForUserByNode = async ({
  user_id,
  node_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const data = await Email.findAll({
      where: {
        user_id: user_id ?? { [Op.ne]: null },
        // cadence_id: cadence_id ?? { [Op.ne]: null }, // skipping cadence_id because it is not required
        sent: true,
        node_id: node_id,
        created_at: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            end_date ??
              moment(new Date(3000, 3, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
          ],
        },
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
        'node_id',
      ],
      group: ['node_id', 'status'],
    });
    // console.log(JsonHelper.parse(data));
    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error(`Error while fetching email status for node: ${err.message}.`);
    return [null, err.message];
  }
};
// getEmailStatusCountForUserByNode({
//   user_id: ['3'],
//   node_id: ['512'],
// });

const EmailRepository = {
  saveReceived,
  saveSent,
  getReceived,
  getSent,
  deleteByMessageId,
  upsert,
  get,
  update,
  createDummyEmail,
  getSentEmailByThreadId,
  deleteEmailsByQuery,
  getEmailsByQuery,
  getEmailByQuery,
  getEmailStatusCountForUserAndCadence,
  getEmailStatusCountForUserByNode,
  getEmailStatusCountForGroupAndCadence,
};

module.exports = EmailRepository;
