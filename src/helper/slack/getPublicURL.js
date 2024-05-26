//Utils
const logger = require('winston');
const { SLACK_USER_TOKEN } = require('../../utils/config');

//Packages
const axios = require('axios');
const FormData = require('form-data');

//Helpers and services
const SlackHelper = require('./index');

const getPublicURL = async ({ permalink_public, url_private }) => {
  try {
    const id = permalink_public.substring(24).split('-')[1];
    const body = {
      file: id,
    };
    const url = 'https://slack.com/api/files.sharedPublicURL';
    let response = await axios.post(url, JSON.stringify(body), {
      headers: {
        authorization: `Bearer ${SLACK_USER_TOKEN}`,
        'content-type': 'application/json',
      },
    });
    if (response.data.ok == false && response.data.error != 'already_public')
      return [null, response.data.error];
    const public_url =
      url_private + '?pub_secret=' + permalink_public.split(id + '-')[1];
    return [public_url, null];
  } catch (err) {
    logger.error('Error while making file public:', err);
    return [null, err.message];
  }
};

module.exports = getPublicURL;
