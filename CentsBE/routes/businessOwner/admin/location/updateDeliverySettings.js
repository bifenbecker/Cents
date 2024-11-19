const updateDeliverySettingsPipeline = require('../../../../pipeline/delivery/generalDeliverySettings/updateDeliverySettings');

const eventEmitter = require('../../../../config/eventEmitter');

async function updateDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        const deliverySettings = await updateDeliverySettingsPipeline({ ...req.body, storeId });
        eventEmitter.emit('storeSettingsUpdated', storeId);
        res.status(200).json({
            success: true,
            isOwndriverSettingsActive: deliverySettings.isOwndriverSettingsActive,
            isOnDemandSettingsActive: deliverySettings.isOnDemandSettingsActive,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = updateDeliverySettings;
