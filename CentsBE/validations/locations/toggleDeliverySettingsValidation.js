const validateActiveDeliveriesAndSubscriptionForStoreShiftTypes = require('../validateActiveDeliveriesAndSubscriptionForStoreShiftTypes');

const toggleDeliverySettingsValidation = async (req, res, next) => {
    try {
        const { deliveryEnabled, storeId } = req.body;

        if (typeof deliveryEnabled === 'boolean') {
            if (!deliveryEnabled) {
                const validRes = await validateActiveDeliveriesAndSubscriptionForStoreShiftTypes({
                    shiftTypes: ['OWN_DELIVERY', 'CENTS_DELIVERY'],
                    storeId,
                });
                if (!validRes.success) {
                    res.status(422).json({ ...validRes });
                    return;
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};
module.exports = exports = toggleDeliverySettingsValidation;
