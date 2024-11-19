const Joi = require('@hapi/joi');

const checkStore = require('../Regions/checkStore');
const hasActiveOrders = require('./hasActiveOrders');
const getBusiness = require('../../utils/getBusiness');
const checkAssignedLocations = require('./assignedLocations');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        isHub: Joi.boolean().required(),
        storeId: Joi.number().integer().required(),
        locationsServed: Joi.when('isHub', {
            is: true,
            then: Joi.array().items(Joi.number().integer()).allow(null, []).required(),
            otherwise: Joi.optional(),
        }),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { id } = req.query;
        req.body.storeId = id;
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const isStoreValid = await checkStore(business, req.query.id);
        if (isStoreValid.error) {
            res.status(422).json({
                error: isStoreValid.error,
            });
            return;
        }
        const { isHub, locationsServed } = req.body;
        if (isHub) {
            if (isStoreValid.store.hubId) {
                res.status(409).json({
                    error: 'Store is assigned to a hub, can not make it a hub.',
                });
                return;
            }
            // commenting out full service validations.
            // if (!isStoreValid.store.offersFullService) {
            //     res.status(409).json({
            //         error: 'Can not update the store as it is does not offer full services.',
            //     });
            //     return;
            // }
        }
        if (isHub && locationsServed.length) {
            /* check if assigned locations are valid or not.  */
            const areLocationsInValid = await checkAssignedLocations(
                locationsServed,
                business.id,
                req.query.id,
            );
            if (areLocationsInValid.length) {
                res.status(422).json({
                    error: areLocationsInValid,
                });
                return;
            }
        }
        const checkOrders = await hasActiveOrders(isHub, isStoreValid.store, locationsServed);
        if (checkOrders.error) {
            res.status(409).json({
                error: checkOrders.message,
            });
            return;
        }
        req.constants = {};
        req.constants.store = isStoreValid.store;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
