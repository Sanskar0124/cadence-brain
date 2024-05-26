// Utils
const logger = require('../utils/winston');

// Models
const { Note } = require('../db/models');

const createNote = async (note) => {
  try {
    const createdNote = await Note.create(note);
    return [createdNote, null];
  } catch (err) {
    logger.error(err.message);
    if (err.errors[0].message === 'lead_id must be unique')
      return [null, err.errors[0].message];
    return [null, err.message]; // for database error
  }
};

const getNoteByQuery = async (query) => {
  try {
    const note = await Note.findOne({
      where: query,
    });
    return [note, null];
  } catch (err) {
    logger.error(`Error while getting note by query: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getNotesByQuery = async (query) => {
  try {
    const note = await Note.findAll({
      where: query,
    });
    return [note, null];
  } catch (err) {
    logger.error(`Error while getting notes by query: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const updateNote = async (note) => {
  try {
    const data = await Note.update(note, {
      where: {
        note_id: note.note_id,
      },
    });
    if (data[0] !== 1) return [null, 'Something went wrong while updating.'];

    const updatedNote = await Note.findOne({
      where: {
        note_id: note.note_id,
      },
    });
    return [updatedNote, null];
  } catch (err) {
    logger.error(`Error while updating note: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const deleteNote = async (query) => {
  try {
    const data = await Note.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting note: ${err.message}`);
    return [null, err.message];
  }
};

const NoteRepository = {
  createNote,
  getNoteByQuery,
  getNotesByQuery,
  updateNote,
  deleteNote,
};

module.exports = NoteRepository;
