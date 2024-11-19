const editDeliveryInstructionsPipeline = require('../../../../pipeline/customer/address/editDeliveryInstructionsPipeline');

/**
 * Save delivery instructions to an existing CentsCustomerAddress model.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateCustomerAddress(req, res, next) {
    try {
        const addressDetails = await editDeliveryInstructionsPipeline(req.body);

        return res.status(200).json({
            success: true,
            addressDetails,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = updateCustomerAddress;
