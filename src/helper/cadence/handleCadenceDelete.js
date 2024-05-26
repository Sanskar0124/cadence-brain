// Repositories
const CadenceRepository = require('../../repository/cadence.repository');
const NodeRepository = require('../../repository/node.repository');
const TaskRepository = require('../../repository/task.repository');
const TagRepository = require('../../repository/tag.repository');

//handle cadences:
//NODES
//tASKS
//Tags
//LEAD_TO_CADENCE

const handleCadenceDelete = async (cadence_id) => {
  //delete nodes
  const [nodeDeletables, errForNodeDeletables] =
    await NodeRepository.deleteNodes({ cadence_id: cadence_id });

  //delete tasks
  const [taskDeletables, errForTaskDeletables] =
    await TaskRepository.deleteTasksByQuery({ cadence_id: cadence_id });

  //delete Tags
  const [tagDeletables, errForTagDeletables] =
    await TagRepository.deleteTagsByQuery({ cadence_id: cadence_id });

  //delete Cadence
  const [cadenceDeletable, errForCadenceDeletable] =
    await CadenceRepository.deleteCadence(cadence_id);

  const errors = [
    errForNodeDeletables,
    errForTaskDeletables,
    errForTagDeletables,
    errForCadenceDeletable,
  ].filter((err) => err !== null);
  if (errors.length > 0) return [null, errors];

  return ['Successfully Deleted Cadence', null];
};

module.exports = handleCadenceDelete;
