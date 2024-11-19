const Joi = require('@hapi/joi');

const checkDistrict = require('../Regions/checkDistrict');
const checkStore = require('../Regions/checkStore');
// const checkAssignedLocations = require('./assignedLocations');
const getBusiness = require('../../utils/getBusiness');
const validateAddress = require('./addressValidation');

function validateSchema(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().required(),
        businessId: Joi.number().optional(),
        name: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        address: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        zipCode: Joi.string()
            .regex(/^[0-9]{5}(?:-[0-9]{4})?$/)
            .required(),
        needsRegions: Joi.boolean().required(),
        districtId: Joi.when('needsRegions', {
            is: true,
            then: Joi.number().required(),
            otherwise: Joi.optional(),
        }),
        timings: Joi.array().optional(),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional(),
        isHub: Joi.boolean().optional(),
        locationsServed: Joi.array().optional(),
        hubId: Joi.number().integer().optional().allow(null, ''),
        stripeLocationId: Joi.string().optional().allow(null, ''),
        stripeTerminalId: Joi.string().optional().allow(null, ''),
        password: Joi.string().optional().allow(null, ''),
        totalRecords: Joi.any(),
        offersFullService: Joi.any(),
        businessServiceCount: Joi.any(),
        storeServiceCount: Joi.any(),
        isBagTrackingEnabled: Joi.boolean(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}
async function validateLocation(req, res, next) {
    try {
        req.body.id = req.query.id;
        const business = await getBusiness(req);

        req.body.needsRegions = business.needsRegions;
        const isValid = validateSchema(req.body);
        /* Type validation */
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message, // .split('[')[1].split(']')[0],
            });
            return;
        }

        /* if store does not exists */
        const isStoreValid = await checkStore(business, req.query.id);
        if (isStoreValid.error) {
            res.status(422).json({
                error: isStoreValid.error,
            });
            return;
        }
        req.currentStore = isStoreValid.store;
        // const { isHub, assignedLocations } = req.body;
        // if (isHub && assignedLocations.length) {
        //     /* check if assigned locations are valid or not.  */
        //  const areLocationsInValid = await checkAssignedLocations(assignedLocations, business.id,
        //         req.query.id);
        //     if (areLocationsInValid.length) {
        //         res.status(422).json({
        //             error: areLocationsInValid,
        //         });
        //         return;
        //     }
        // }

        if (!req.body.needsRegions) {
            /* doesn't have regions */
            next();
            return;
        }

        const isDistrictInValid = await checkDistrict(req, business, req.body.districtId);
        /* validate district */
        if (isDistrictInValid.length) {
            res.status(422).json({
                error: isDistrictInValid,
            });
            return;
        }
        const { address, zipCode, city, state } = req.body;
        const addressString = `${address}, ${city}, ${state}, US, ${zipCode}`;

        await validateAddress(addressString);
        next();
    } catch (error) {
        if (error.message === 'INVALID_ADDRESS') {
            res.status(422).json({
                error: "The address you've entered is invalid.",
            });
            return;
        }
        next(error);
    }
}

module.exports = exports = validateLocation;
