const LoggerHandler = require('../../../../../LoggerHandler/LoggerHandler');
const Store = require('../../../../../models/store');

async function updateEsdSettings(req, res, next) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({
                error: 'location id is required.',
            });
        }
        const { hasEsdEnabled } = req.body;

        if (hasEsdEnabled === null) {
            const errMsg = 'A value for the ESD setting is required.';
            LoggerHandler('error', errMsg, req);
            return res.status(422).json({
                error: errMsg,
            });
        }

        await Store.query()
            .patch({
                hasEsdEnabled,
            })
            .where('id', id);

        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = updateEsdSettings;
