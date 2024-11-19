const updateOnDemandDeliverySettingsPipeline = require('../../../../pipeline/delivery/onDemandDeliverySettings/updateOnDemandDeliverySettings');

const eventEmitter = require('../../../../config/eventEmitter');

async function updateDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        await updateOnDemandDeliverySettingsPipeline({ ...req.body, storeId });
        eventEmitter.emit('storeSettingsUpdated', storeId);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = updateDeliverySettings;
