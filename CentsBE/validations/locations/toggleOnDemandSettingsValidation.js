const validateActiveDeliveriesAndSubscriptionForStoreShiftTypes = require('../validateActiveDeliveriesAndSubscriptionForStoreShiftTypes');

const toggleOnDemandDeliverySettingsValidation = async (req, res, next) => {
    try {
        const { active } = req.body;
        const { storeId } = req.params;

        if (typeof active === 'boolean') {
            if (!active) {
                const validRes = await validateActiveDeliveriesAndSubscriptionForStoreShiftTypes({
                    shiftTypes: ['CENTS_DELIVERY'],
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
module.exports = exports = toggleOnDemandDeliverySettingsValidation;
