const removeZipCodeValidationPipeline = require('../../../../pipeline/locations/removeZipCodeValidationPipeline');

const removeZipCodeValidation = async (req, res, next) => {
    try {
        const { zipCodes } = req.body;
        const { storeId } = req.params;
        const { zipCodesForRecurringSubscription, zipCodesForDelivery } =
            await removeZipCodeValidationPipeline({ storeId, zipCodes });
        res.status(200).json({
            success:
                zipCodesForDelivery.length === 0 && zipCodesForRecurringSubscription.length === 0,
            zipCodesForRecurringSubscription,
            zipCodesForDelivery,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports = removeZipCodeValidation;
