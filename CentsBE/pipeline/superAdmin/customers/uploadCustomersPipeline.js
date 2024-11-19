const Pipeline = require('../../pipeline');

// Uows
const readCustomerUploadFile = require('../../../uow/superAdmin/customers/readCustomerUploadFileUow');

/**
 * Run the pipeline to upload a list of customers
 *
 * This pipeline includes the following UoWs:
 *
 * 1) format and process file contents
 * 2) package data into background job
 *
 * Payload should include:
 *
 * 1) fileToUpload - buffer or filepath
 * 2) businessId - number
 * 3) selectedStores - array
 *
 * @param {Object} payload
 */
async function uploadCustomersPipeline(payload) {
    try {
        const customerPipeline = new Pipeline([readCustomerUploadFile]);
        const output = await customerPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = uploadCustomersPipeline;
