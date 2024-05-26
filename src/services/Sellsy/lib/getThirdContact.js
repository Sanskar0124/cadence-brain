// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');
const FormData = require('form-data');

const getThirdContact = async (access_token, thirdcontactid) => {
  try {
    let formData = new FormData();
    formData.append('request', '1');
    formData.append('io_mode', 'json');
    formData.append(
      'do_in',
      JSON.stringify({ method: 'Peoples.getOne', params: { thirdcontactid } })
    );

    const config = {
      method: 'post',
      url: 'https://apifeed.sellsy.com/0/',
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...formData.getHeaders(),
      },
      data: formData,
      maxContentLength: Infinity, // Add this option to prevent Axios from limiting response size
    };

    const response = await axios.request(config);
    const result = {
      id: response?.data?.response?.id,
      corpid: response?.data?.response?.corpid,
      ownerid: response?.data?.response?.ownerid,
    };

    return [result, null];
  } catch (err) {
    logger.error('Error while fetching linked contact form sellsy: ', err);
    return [null, err.message];
  }
};

module.exports = getThirdContact;
