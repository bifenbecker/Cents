const deleteCustomerAddressPipeline = require('../../../../pipeline/customer/address/deleteCustomerAddressPipeline');

async function deleteCustomerAddress(req, res, next) {
    try {
        const { id } = req.params;
        const deletedAddress = await deleteCustomerAddressPipeline({ id });

        res.status(200).json({
            success: true,
            deletedAddress,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = deleteCustomerAddress;
