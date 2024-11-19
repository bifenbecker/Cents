const _ = require('lodash');
const Joi = require('@hapi/joi');
const checkRegion = require('./isRegionValid');
const checkDistrict = require('./checkDistrict');
const getBusiness = require('../../utils/getBusiness');
const formatError = require('../../utils/formatError');

function regionsValidation(inputSchema) {
    const validationSchema = Joi.object().keys({
        region: Joi.object()
            .keys({
                name: Joi.string()
                    .required()
                    .error(() => 'Region name cannot be empty'),
                id: Joi.number().integer().optional(),
                isDeleted: Joi.boolean().optional(),
                createdAt: Joi.date().optional(),
                updatedAt: Joi.date().optional(),
                businessId: Joi.number().optional(),
                districts: Joi.array()
                    .items(
                        Joi.object().keys({
                            name: Joi.string()
                                .required()
                                .error(() => 'District name cannot be empty'),
                            id: Joi.number().optional(),
                            isDeleted: Joi.boolean().optional(),
                            regionId: Joi.number().optional(),
                            createdAt: Joi.date().optional(),
                            updatedAt: Joi.date().optional(),
                        }),
                    )
                    .allow([], null)
                    .required(),
            })
            .required(),
    });
    const error = Joi.validate(inputSchema, validationSchema);
    return error;
}

/**
 * Function to split array.
 */

function splitIntoArrays(regionId, districts) {
    const splitArrays = {};
    let newRecords = districts.filter((district) => district.id === undefined);
    /* Map region id to the records. */

    newRecords = newRecords.map((record) => {
        const newRecord = {
            regionId,
            ...record,
        };
        return newRecord;
    });
    let updateRecords = districts.filter((district) => district.id !== undefined);
    /* Map region id to the records to be updated. */

    updateRecords = updateRecords.map((record) => {
        const newRecord = {
            regionId,
            ...record,
        };
        return newRecord;
    });
    splitArrays.newRecords = newRecords;
    splitArrays.updateRecords = updateRecords;
    return splitArrays;
}

/* Check if all the districts in request are unique */

function checkForDuplicates(districts) {
    const uniqueDistricts = _.uniqBy(districts, (district) => district.name.toUpperCase());
    if (uniqueDistricts.length !== districts.length) {
        return false;
    }
    return true;
}

const dbValidate = async (req, res, next) => {
    try {
        const isValid = regionsValidation(req.body);
        if (isValid.error) {
            if (isValid.error.details && isValid.error.details[0]) {
                res.status(422).json({
                    error: isValid.error.details[0].message,
                });
            } else {
                res.status(422).json({
                    error: formatError(isValid.error),
                });
            }
            return;
        }
        const { region } = req.body;

        // get id, name, districts from regions.

        const { id, name, districts } = region;

        // Check if region in valid or not.

        const business = await getBusiness(req);

        const isRegion = await checkRegion(business, name, id);

        if (isRegion.error.length) {
            // if region is invalid.
            res.status(422).json({
                error: isRegion.error,
            });
            return;
        }
        // If the region is new.
        if (isRegion.isNew) {
            req.body.isNew = true;
            next();
            return;
        }
        if (!checkForDuplicates(districts)) {
            res.status(422).json({
                error: 'Duplicates in district names found.',
            });
            return;
        }
        const { newRecords, updateRecords } = splitIntoArrays(id, districts);
        const updateRecordsValid = await checkDistrict(req, business, updateRecords);
        /* Check validity of the record to be updated. */

        if (updateRecordsValid.length) {
            res.status(422).json({
                error: updateRecordsValid,
            });
            return;
        }

        /* Check validity of new Records. */
        const newRecordsValid = await checkDistrict(req, business, newRecords, true);

        if (newRecordsValid.length) {
            res.status(422).json({
                error: newRecordsValid,
            });
            return;
        }
        req.body.newRecords = newRecords;
        req.body.updateRecords = updateRecords;
        req.body.isNew = false;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = exports = dbValidate;
