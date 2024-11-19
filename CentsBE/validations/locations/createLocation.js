const Joi = require('@hapi/joi');

const checkDistrict = require('../Regions/checkDistrict');
const checkAssignedLocations = require('./assignedLocations');
const getBusiness = require('../../utils/getBusiness');
const formatError = require('../../utils/formatError');
const validateAddress = require('./addressValidation');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        businessId: Joi.number().integer().required(),
        name: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        address: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        zipCode: Joi.string()
            .regex(/^[0-9]{5}(?:-[0-9]{4})?$/)
            .required(),
        password: Joi.string().required(),
        confirmPassword: Joi.string().required(),
        dcaLicense: Joi.string().optional(),
        commercialDcaLicense: Joi.string().optional(),
        taxRateId: Joi.number().integer().optional(),
        needsRegions: Joi.boolean().required(),
        districtId: Joi.when('needsRegions', {
            is: true,
            then: Joi.number().required(),
            otherwise: Joi.optional(),
        }),
        // isHub: Joi.boolean().optional(),
        // assignedLocations: Joi.when('isHub', {
        //     is: true,
        //     then: Joi.array().items(Joi.number()).required().allow([]),
        // }),
        // hubId: Joi.number().integer().optional(),
    });
    // .xor('hubId', 'assignedLocations');
    // Hub is not in current scope.

    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validateLocation(req, res, next) {
    try {
        const business = await getBusiness(req);

        const { needsRegions } = business;
        req.body.needsRegions = needsRegions;
        req.body.businessId = business.id;
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        if (req.body.password !== req.body.confirmPassword) {
            res.status(400).json({
                error: 'passwords donot match',
            });
            return;
        }
        if (needsRegions) {
            const isDistrictInvalid = await checkDistrict(req, business, req.body.districtId);
            if (isDistrictInvalid) {
                res.status(422).json({
                    error: isDistrictInvalid,
                });
                return;
            }
        }
        const { isHub, assignedLocations, address, zipCode, state, city } = req.body;
        /* Check if assigned locations are valid or not. */
        if (isHub && assignedLocations.length) {
            const areLocationsInValid = await checkAssignedLocations(
                assignedLocations,
                business.id,
            );
            if (areLocationsInValid.length) {
                res.status(422).json({
                    error: areLocationsInValid,
                });
                return;
            }
        }
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
