const Joi = require('@hapi/joi');

const Store = require('../../../models/store');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        phoneNumber: Joi.string().required(),
        dateScheduled: Joi.string().required(),
        serviceOrderId: Joi.number().required(),
        storeId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Calculate the difference between two timestamps
 *
 * @param {String} dateScheduled
 * @param {String} currentTime
 */
function getDifferenceInTime(dateScheduled, currentTime) {
    const formattedCurrentTime = new Date(currentTime);
    const scheduledTime = new Date(dateScheduled);

    const differenceInMs = Math.abs(scheduledTime - formattedCurrentTime);
    const differenceInMinutes = Math.floor(differenceInMs / 1000 / 60);
    const differenceInDays = Math.floor(differenceInMs / 1000 / 60 / 60 / 24);

    return { differenceInMinutes, differenceInDays };
}

/**
 * Determine whether the request to send a scheduled text message is valid or not.
 *
 * Outside of input validations, we also need to verify the the message must be scheduled
 * at least 60 min in advance of message send time,
 * and cannot be scheduled more than 7 days in advance of the request.
 *
 * Therefore, the incoming dateScheduled must be:
 *
 * 1) greater than 60 mins; AND
 * 2) less than 7 days
 *
 * of current time
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { storeId, dateScheduled } = req.body;

        const store = await Store.query().withGraphFetched('settings').findById(storeId);
        if (store.settings && !store.settings.hasSmsEnabled) {
            res.status(422).json({
                error: 'SMS is currently disabled for this store. Please reach out to Cents Support for additional help.',
            });
            return;
        }

        const currentTime = new Date().toISOString();
        if (currentTime >= dateScheduled) {
            res.status(422).json({
                error: 'You cannot schedule an SMS to be sent in the past.',
            });
            return;
        }

        const differenceObject = getDifferenceInTime(dateScheduled, currentTime);
        const { differenceInMinutes, differenceInDays } = differenceObject;

        if (differenceInMinutes <= 60) {
            res.status(422).json({
                error: 'The scheduled SMS date needs to be more than 60 minutes in advance.',
            });
            return;
        }

        if (differenceInDays >= 7) {
            res.status(422).json({
                error: 'The scheduled SMS date cannot be more than 7 days in advance.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
