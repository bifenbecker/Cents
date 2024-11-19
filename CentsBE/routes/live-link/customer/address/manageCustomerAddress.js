const manageCustomerAddressPipeline = require('../../../../pipeline/customer/address/manageCustomerAddressPipeline');

async function updateCustomerAddress(req, res, next) {
    try {
        const { id } = req.currentCustomer;
        const { googlePlacesId } = req.params;

        const { centsCustomerAddress } = await manageCustomerAddressPipeline({
            centsCustomerId: id,
            customerAddressPayload: { ...req.body, googlePlacesId },
        });

        return res.status(200).json({
            success: true,
            centsCustomerAddress,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = updateCustomerAddress;
