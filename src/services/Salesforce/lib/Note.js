const logger = require('../../../utils/winston');
const axios = require('axios');
const HtmlHelper = require('../../../helper/html');

const createSalesforceNote = async (
  note,
  title,
  salesforce_lead_id,
  access_token,
  instance_url
) => {
  try {
    if (!note) note = title;
    let [cleanNote, errForCleanNote] = HtmlHelper.removeHtmlTags(note);
    if (errForCleanNote) return [null, errForCleanNote];

    let Title = title ?? 'Note';

    let body = {
      Title,
      Content: Buffer.from(`<html><body>${note}</body></html>`).toString(
        'base64'
      ),
    };

    // Creating Content Note in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/ContentNote`;
    const response = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.data.success) {
      logger.error('Something went wrong while creating note');
      console.log(response.data.errors);
      return [null, response.data.errors];
    }

    // Creating ContentDocumentLink in salesforce to link to note to a lead
    body = {
      ContentDocumentId: response.data.id,
      LinkedEntityId: salesforce_lead_id,
    };

    URL = `${instance_url}/services/data/v52.0/sobjects/ContentDocumentLink`;
    const linkResponse = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!linkResponse.data.success) {
      logger.error('Something went wrong while linking note to lead');
      console.log(linkResponse.data.errors);
      return [null, linkResponse.data.errors];
    }

    console.log(linkResponse.data);
    return [response.data.id, null];
  } catch (err) {
    if (err?.response?.data)
      logger.error(
        `Error while creating salesforce note: ${JSON.stringify(
          err.response?.data
        )}`
      );
    else logger.error(`Error while creating salesforce note: ${err.message}`);
    return [null, err];
  }
};

const updateSalesforceNote = async (
  note,
  salesforce_note_id,
  access_token,
  instance_url
) => {
  try {
    let [cleanNote, errForCleanNote] = HtmlHelper.removeHtmlTags(note);
    if (errForCleanNote) return [null, errForCleanNote];

    let Title = cleanNote.split(' ').slice(0, 3).join(' ');
    let body = {
      Title,
      Content: Buffer.from(`<html><body>${note}</body></html>`).toString(
        'base64'
      ),
    };

    // Updating Content Note in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/ContentNote/${salesforce_note_id}`;
    const response = await axios.patch(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.status === 404) {
      logger.error('Something went wrong while updating note');
      return [null, response.data];
    }

    return [true, null];
  } catch (err) {
    logger.error(`Error while updating salesforce note: ${err.message}`);
    return [null, err];
  }
};

const deleteSalesforceNote = async (
  salesforce_note_id,
  access_token,
  instance_url
) => {
  try {
    // Deleting Content Note in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/ContentNote/${salesforce_note_id}`;
    const response = await axios.delete(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.status === 204) {
      logger.info('Note deleted from salesforce succesfully');
      return [true, null];
    }
    logger.error('Note does not exist');
    return [null, response.data.message];
  } catch (err) {
    logger.error(`Error while deleting salesforce note: ${err.message}`);
    return [null, err];
  }
};

module.exports = {
  createSalesforceNote,
  updateSalesforceNote,
  deleteSalesforceNote,
};
