const StoreSettings = require('../../../../../models/storeSettings');
const eventEmitter = require('../../../../../config/eventEmitter');

async function updateSettings(req, res, next) {
    try {
        const { id } = req.params;
        const storeSettings = await StoreSettings.query()
            .patch(req.body)
            .where('storeId', id)
            .returning('*')
            .first();

        eventEmitter.emit('storeSettingsUpdated', id);
        res.status(200).json({
            success: true,
            storeSettings,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateSettings;
