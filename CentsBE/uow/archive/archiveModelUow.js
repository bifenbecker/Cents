/**
 * Set the isDeleted flag for a given model
 *
 * @param {Object} payload
 */
async function archiveModel(payload) {
    try {
        const newPayload = payload;
        const { transaction, modelName, modelId, archiveBoolean } = newPayload;

        const sampleRow = await modelName.query().limit(1);
        const columns = sampleRow.length ? Object.keys(sampleRow[0]) : [];

        const archivedModel = await modelName
            .query(transaction)
            .patch({
                ...(columns.includes('isDeleted') && { isDeleted: archiveBoolean }),
                deletedAt: archiveBoolean ? new Date().toISOString() : null,
            })
            .findById(modelId)
            .returning('*');

        newPayload.archivedModel = archivedModel;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = archiveModel;
