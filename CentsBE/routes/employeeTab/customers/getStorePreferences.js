const StoreCustomer = require('../../../models/storeCustomer');

async function getStorePreferences(req, res, next) {
    const businessId = parseInt(req.params.businessId, 10);
    const centsCustomerId = parseInt(req.params.id, 10);
    const storeId = parseInt(req.params.storeId, 10);

    try {
        const storeCustomer = await StoreCustomer.query().where({
            businessId,
            centsCustomerId,
            storeId,
        });

        if (storeCustomer.length > 0) {
            res.status(200).json({
                success: true,
                storePreferences: {
                    notes: storeCustomer[0].notes || '',
                    isHangDrySelected: storeCustomer[0].isHangDrySelected || false,
                    hangDryInstructions: storeCustomer[0].hangDryInstructions || '',
                },
            });
        } else {
            res.status(404).end();
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getStorePreferences;
