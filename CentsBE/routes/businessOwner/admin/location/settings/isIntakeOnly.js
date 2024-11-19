const Store = require('../../../../../models/store');
const { locationType } = require('../../../../../constants/constants');
const eventEmitter = require('../../../../../config/eventEmitter');

async function toggleIsIntakeOnly(req, res, next) {
    try {
        const { id } = req.params;
        const { isIntakeOnly } = req.body;
        const store = await Store.query()
            .patch({
                isIntakeOnly,
                type: isIntakeOnly ? locationType.INTAKE_ONLY : locationType.STORE,
            })
            .findById(id)
            .returning('*');
        eventEmitter.emit('storeSettingsCreated', store.id);
        res.status(200).json({
            success: true,
            store,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = toggleIsIntakeOnly;
