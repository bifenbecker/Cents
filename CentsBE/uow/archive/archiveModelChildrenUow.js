const Promise = require('bluebird');

/**
 * Set the isDeleted flag for a given model's children
 *
 * @param {Object} payload
 */
async function archiveModelChildren(payload) {
    try {
        const newPayload = payload;
        const { transaction, modelName, modelChildName, modelId, archiveBoolean } = newPayload;

        if (!modelChildName) return newPayload; // model children not defined, skip this step

        const children = await modelName.relatedQuery(modelChildName.tableName).for(modelId);
        const columns = children.length ? Object.keys(children[0]) : [];

        const archivedModelChildren = await Promise.map(children, (child) =>
            modelChildName
                .query(transaction)
                .patch({
                    ...(columns.includes('isDeleted') && { isDeleted: archiveBoolean }),
                    deletedAt: archiveBoolean ? new Date().toISOString() : null,
                })
                .findById(child.id)
                .returning('*'),
        );

        newPayload.archivedModelChildren = archivedModelChildren;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = archiveModelChildren;
