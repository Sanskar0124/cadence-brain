// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

const retryCallbackTask = async ({ node, task }) => {
  try {
    //extract nodeData allowed from node
    const { retries: retries_allowed, retry_after } = node?.data;

    // skip task if data is corrupted
    if (!retries_allowed || !retry_after)
      return [null, 'SkipError: Data for callback node is corrupted'];

    //extract retries made till now from meta data from task
    let metadata = task?.metadata ?? {};
    const retries = metadata.retries ?? 0;

    if (retries < retries_allowed) {
      logger.info(
        `Retries left ${
          retries_allowed - retries
        }. Updating start_time and retries done for the task.`
      );
      // update task metadata with retries made and
      metadata.retries = retries + 1;

      // buffer for next startTime
      const newStartTime = new Date().getTime() + parseInt(retry_after) * 1000; //converting to milliseconds

      const [updateRetries, updateRetriesErr] = await Repository.update({
        tableName: DB_TABLES.TASK,
        query: { task_id: task.task_id },
        updateObject: {
          metadata,
          start_time: newStartTime,
        },
      });
      if (updateRetriesErr) {
        logger.error(
          `Error occurred while updating retries in task metadata: ${updateRetriesErr}.`
        );
        return [null, updateRetriesErr];
      }

      return ['Successfully retried', null];
    } else {
      //set to_show->true and destroy automated task
      logger.info(
        `No more retries left for callback task. Converting it to manual task by setting to_show:true.`
      );
      const [updateToShow, updateToShowErr] = await Repository.update({
        tableName: DB_TABLES.TASK,
        query: { task_id: task.task_id },
        updateObject: {
          to_show: true,
        },
      });
      //handle error more efficiently
      if (updateToShowErr)
        logger.error(
          `Error occurred while updating to_show in task: ${updateToShowErr}.`
        );

      return ['Successfully created to manual task', null];
    }
  } catch (err) {
    logger.error(`Error occurred in retryCallbackTask: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = retryCallbackTask;
