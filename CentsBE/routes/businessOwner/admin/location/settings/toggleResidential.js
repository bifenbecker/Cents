const Store = require('../../../../../models/store');
const { locationType } = require('../../../../../constants/constants');
const eventEmitter = require('../../../../../config/eventEmitter');
const LoggerHandler = require('../../../../../LoggerHandler/LoggerHandler');

async function toggleResidential(req, res, next) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({
                error: 'locationId is required.',
            });
        }
        const store = await Store.query().select('type').findById(id);
        if (store.isLocationResidential() || store.isLocationIntakeOnly()) {
            await Store.query()
                .patch({
                    type: store.isLocationIntakeOnly()
                        ? locationType.RESIDENTIAL
                        : locationType.INTAKE_ONLY,
                })
                .where('id', '=', id);

            eventEmitter.emit('storeSettingsCreated', id);

            return res.status(200).json({
                success: true,
            });
        }
        const errMsg = 'Residential toggle can be only toggled for a intake only location';
        LoggerHandler('error', errMsg, req);
        return res.status(422).json({
            error: errMsg,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = toggleResidential;
