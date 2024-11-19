const Pipeline = require('../pipeline');

// Uows
const archiveModel = require('../../uow/archive/archiveModelUow');
const archiveModelChildren = require('../../uow/archive/archiveModelChildrenUow');
const validateRoleUow = require('../../uow/archive/validateRoleUow');
const validateDriveUow = require('../../uow/archive/validateDriveUow');
const validateArchivedTeamMemberUow = require('../../uow/archive/validateArchivedTeamMemberUow');

const Task = require('../../models/tasks');
const Inventory = require('../../models/inventory');
const TeamMember = require('../../models/teamMember');

/**
 * Archive a given model
 *
 * The pipeline contains a unit of work that will set an 'isDeleted' flag for a given model
 *
 * @param {Object} payload
 * @param {function} errorHandler
 */

const archiveModelPipelineFactory = (payload, errorHandler) => {
    const { modelName } = payload;
    const pipelineInstancesMap = new Map([
        [Task.tableName, new Pipeline([archiveModel, archiveModelChildren])],
        [Inventory.tableName, new Pipeline([archiveModel, archiveModelChildren])],
        [
            TeamMember.tableName,
            new Pipeline(
                [
                    validateArchivedTeamMemberUow,
                    validateRoleUow,
                    validateDriveUow,
                    archiveModel,
                    archiveModelChildren,
                ],
                errorHandler,
            ),
        ],
    ]);

    return pipelineInstancesMap.get(modelName.tableName);
};

async function archiveModelPipeline(payload, errorHandler) {
    try {
        const archivePipeline = archiveModelPipelineFactory(payload, errorHandler);
        const output = await archivePipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = archiveModelPipeline;
