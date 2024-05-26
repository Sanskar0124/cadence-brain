const { default: axios } = require('axios');
const {
  RINGOVER_API_URL,
  RINGOVER_API_US_URL,
} = require('../../../utils/config');

const http = (apiKey) => {
  let URL = `${RINGOVER_API_URL}`;
  if (apiKey.startsWith('US_')) URL = `${RINGOVER_API_US_URL}`;
  return axios.create({
    baseURL: URL,
    headers: {
      Authorization: apiKey,
    },
  });
};

module.exports = http;
