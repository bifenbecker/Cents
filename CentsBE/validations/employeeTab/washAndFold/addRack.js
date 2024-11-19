const Joi = require('@hapi/joi');
const BusinessSettings = require('../../../models/businessSettings');

function typeValidations(inputObj, hasDryCleaningEnabled) {
    const schema = Joi.object().keys({
        rack: hasDryCleaningEnabled
            ? Joi.array()
                  .items(
                      Joi.object().keys({
                          id: Joi.number().optional(),
                          rackInfo: Joi.string().required().allow(null, ''),
                      }),
                  )
                  .allow(null, '')
            : Joi.string().min(1).max(24).required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { status, rack } = req.body;
        const { version } = req.headers;
        if (status !== 'READY_FOR_PICKUP' || !rack) {
            next();
            return;
        }

        const businessSettings = await BusinessSettings.query().findOne({
            businessId: req.currentStore.businessId,
        });
        const cents20Flag = !!businessSettings?.dryCleaningEnabled;
        const hasDryCleaningEnabled = version >= '2.0.0' && cents20Flag;

        const { requiresRack } = req.currentStore.settings;
        if (requiresRack) {
            const isValid = typeValidations({ rack }, hasDryCleaningEnabled);
            if (isValid.error) {
                res.status(422).json({
                    error: isValid.error.message,
                });
                return;
            }
        }
        const rackValue = hasDryCleaningEnabled ? rack.length > 0 : rack;

        if (!requiresRack && rackValue) {
            res.status(422).json({
                error: 'Rack is not allowed.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
