const Joi = require('@hapi/joi');
const ServiceOrderWeight = require('../../../models/serviceOrderWeights');
const BusinessSettings = require('../../../models/businessSettings');
const { statuses } = require('../../../constants/constants');

// TODO Update
function typeValidations(inputObj, cents20Enabled) {
    let schema = Joi.object().keys({
        totalWeight: Joi.number().required(),
        chargeableWeight: Joi.number().required(),
        teamMemberId: Joi.number().integer().optional().allow(null, ''),
    });

    if (cents20Enabled) {
        schema = schema.append({
            bagCount: Joi.number().integer().required(),
        });
    } else {
        schema = schema.append({
            bagCount: Joi.number().integer().required().min(1),
        });
    }

    const validate = Joi.validate(inputObj, schema);
    return validate;
}

// TODO update
async function findIfOrderItemsHasWeight(orderId) {
    const orderDetails = await ServiceOrderWeight.query()
        .where('serviceOrderId', orderId)
        .orderBy('id', 'desc')
        .limit(1);
    return orderDetails;
}

async function verifyRequest(req, res, next) {
    try {
        const { version } = req.headers;
        const { weight, id } = req.body;
        const { status } = req.body;
        // TODO update
        if (
            status === 'DESIGNATED_FOR_PROCESSING_AT_HUB' ||
            status === 'IN_TRANSIT_TO_STORE' ||
            status === 'IN_TRANSIT_TO_HUB' ||
            status === 'RECEIVED_AT_HUB_FOR_PROCESSING' ||
            status === 'CANCELLED' ||
            status === 'DROPPED_OFF_AT_HUB'
        ) {
            next();
            return;
        }
        const { currentStatus, isBagTrackingEnabled, isOrder } = req.constants;

        if (
            currentStatus === 'IN_TRANSIT_TO_STORE' &&
            !isBagTrackingEnabled &&
            status === 'HUB_PROCESSING_COMPLETE'
        ) {
            next();
            return;
        }

        const businessSettings = await BusinessSettings.query()
            .where('businessId', req.currentStore.businessId)
            .first();

        if (
            ((status === 'PROCESSING' && businessSettings.isWeightBeforeProcessing === false) ||
                (statuses.READY_FOR_PICKUP === status &&
                    businessSettings.isWeightAfterProcessing === false) ||
                ([statuses.COMPLETED, statuses.EN_ROUTE_TO_CUSTOMER].includes(status) &&
                    businessSettings.isWeightUpOnCompletion === false)) &&
            !isOrder.isProcessedAtHub
        ) {
            next();
            return;
        }

        if (
            ((status === 'HUB_PROCESSING_ORDER' &&
                businessSettings.isWeightBeforeProcessing === false) ||
                (status === 'HUB_PROCESSING_COMPLETE' &&
                    businessSettings.isWeightAfterProcessing === false) ||
                (status === 'READY_FOR_PICKUP' &&
                    businessSettings.isWeightReceivingAtStore === false) ||
                (status === 'COMPLETED' && businessSettings.isWeightUpOnCompletion === false)) &&
            isOrder.isProcessedAtHub
        ) {
            next();
            return;
        }

        const hasWeights = await findIfOrderItemsHasWeight(id);
        const cents20Flag = !!businessSettings?.dryCleaningEnabled;
        const hasDryCleaningEnabled = version >= '2.0.0' && cents20Flag;
        if ((!weight || !weight.totalWeight) && !hasDryCleaningEnabled) {
            if (hasWeights.length) {
                res.status(409).json({
                    error: 'Weight measurement is necessary to change the order status.',
                });
                return;
            }
            next();
            return;
        }
        const isValid = typeValidations(req.body.weight, hasDryCleaningEnabled);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        // online orders do not have weights assigned yet
        if (hasDryCleaningEnabled && isOrder.orderType === 'ONLINE') {
            next();
            return;
        }

        if (!hasWeights.length && weight) {
            res.status(409).json({
                error: 'All order items are of type FIXED_PRICE can not add a weight measurement.',
            });
            return;
        }
        req.constants.step = hasWeights[0].step + 1;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyRequest;
