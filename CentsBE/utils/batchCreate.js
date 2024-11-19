const uuidv4 = require('uuid/v4');

const batchModel = require('../models/batch');

const createBatch = async (businessId, transaction) => {
    try {
        const batchName = uuidv4();
        const batch = await batchModel.query(transaction).insert({
            businessId,
            batchName,
        });
        return batch;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = createBatch;
