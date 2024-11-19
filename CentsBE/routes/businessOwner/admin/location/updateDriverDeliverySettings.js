const UpdateOwnDriverDeliverySettingsService = require('../../../../services/deliverySettings/updateOwnDriverDeliverySettings');

const eventEmitter = require('../../../../config/eventEmitter');

async function updateDriverSettings(req, res, next) {
    try {
        const { storeId } = req.params;
        const updateDriverSettingsService = new UpdateOwnDriverDeliverySettingsService(
            storeId,
            req.body || {},
        );
        await updateDriverSettingsService.execute();
        eventEmitter.emit('storeSettingsUpdated', storeId);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (error.message === 'invalid_zipcode') {
            res.status(404).json({
                error: 'Please enter valid zip code(s)',
            });
            return;
        }
        if (error.message === 'zipcode_exists') {
            res.status(409).json({
                error: 'Zip code(s) exists for other store(s)',
            });
            return;
        }
        next(error);
    }
}
module.exports = exports = updateDriverSettings;
