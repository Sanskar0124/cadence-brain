// Utils
const logger = require('../utils/winston');

// Models
const { Signature } = require('../db/models');

const createSignature = async (signature) => {
  try {
    const createdSignature = await Signature.create(signature);
    return [createdSignature, null];
  } catch (err) {
    logger.error(`Error while creating signature: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getSignatureById = async (signature_id, user_id) => {
  try {
    const signature = await Signature.findOne({
      where: {
        signature_id,
        user_id,
      },
    });
    return [signature, null];
  } catch (err) {
    logger.error(`Error while fetching signature by id: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getAllSignatures = async (user_id) => {
  try {
    const signatures = await Signature.findAll({
      where: {
        user_id,
      },
    });
    return [JSON.parse(JSON.stringify(signatures)), null];
  } catch (err) {
    logger.error(`Error while fetching all signatures: ${err.message}`);
    return [null, err.message];
  }
};

const updateSignature = async (signature) => {
  try {
    const data = await Signature.update(signature, {
      where: {
        signature_id: signature.signature_id,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while updating signature: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const deleteSignature = async (query) => {
  try {
    const data = await Signature.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting signature: ${err.message}`);
    return [null, err];
  }
};

const updateSignatures = async (query, toUpdate) => {
  try {
    const data = await Signature.update(toUpdate, {
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while updating signatures: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getDefaultSignature = async (user_id) => {
  try {
    const signature = await Signature.findOne({
      where: {
        is_primary: true,
        user_id,
      },
    });
    return [signature, null];
  } catch (err) {
    logger.error(`Error while fetching default signatures: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const SignatureRepository = {
  createSignature,
  getSignatureById,
  getAllSignatures,
  updateSignature,
  deleteSignature,
  updateSignatures,
  getDefaultSignature,
};

module.exports = SignatureRepository;
