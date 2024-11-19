const Joi = require('@hapi/joi');
const ServiceOrder = require('../../../models/serviceOrders');
const { statuses, hubStatues } = require('../../../constants/constants');
const { ERROR_MESSAGES } = require('../../../constants/error.messages');
const { employeeCodeIgnoreStatus } = require('../../../constants/constants');
const validateEmployeeCode = require('../../validateEmployeeCode');

async function verifyRequest(req, res, next) {
    try {
        const schema = Joi.object().keys({
            id: Joi.number().integer().required(),
            status: Joi.string()
                .valid(Object.values(statuses), Object.values(hubStatues))
                .required(),
            isProcessedAtHub: Joi.boolean().optional(),
            notifyUser: Joi.boolean().optional(),
            employeeCode: Joi.string().optional().allow(null),
            // TODO update
            weight: Joi.object()
                .keys({
                    totalWeight: Joi.any(),
                    chargeableWeight: Joi.number(),
                    bagCount: Joi.number().integer().allow(null).optional(),
                    teamMemberId: Joi.number().integer(),
                })
                .allow(null)
                .optional(),
            rack: Joi.any(),
            notes: Joi.string().allow(null, '').optional(),
        });

        const isValid = Joi.validate(req.body, schema);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { requiresEmployeeCode, isWeightReceivingAtStore } = req.currentStore.settings;
        const isOrder = await ServiceOrder.query().findOne({
            id: req.body.id,
        });
        if (!isOrder) {
            res.status(404).json({
                error: 'Order not found',
            });
            return;
        }
        const { status } = req.body;

        const requiresAdditionalEmpVal =
            status === 'READY_FOR_PICKUP' && isOrder.isProcessedAtHub
                ? isWeightReceivingAtStore && requiresEmployeeCode
                : true;

        if (
            requiresEmployeeCode &&
            !employeeCodeIgnoreStatus.includes(status) &&
            requiresAdditionalEmpVal
        ) {
            await validateEmployeeCode(
                req.body.employeeCode,
                req.currentStore.businessId,
                req.currentStore.id,
            );
        }
        if (req.currentStore.isHub) {
            if (
                !(isOrder.storeId === req.currentStore.id || isOrder.hubId === req.currentStore.id)
            ) {
                res.status(403).json({
                    error: ERROR_MESSAGES.NOT_AUTHORIZED_TO_MODIFY,
                });
                return;
            }
        } else {
            if (isOrder.storeId !== req.currentStore.id) {
                res.status(403).json({
                    error: ERROR_MESSAGES.NOT_AUTHORIZED_TO_MODIFY,
                });
                return;
            }
        }

        if (isOrder.isProcessedAtHub || status === statuses.DESIGNATED_FOR_PROCESSING_AT_HUB) {
            if (req.currentStore.hubId === null && !req.currentStore.isHub) {
                res.status(404).json({
                    error: ERROR_MESSAGES.HUB_NOT_ASSOCIATED_WITH_STORE,
                });
                return;
            }
        }
        if (status === isOrder.status) {
            res.status(409).json({
                error: `Orders is already in ${status} state.`,
            });
            return;
        }
        // commenting out according to https://cents.atlassian.net/browse/CENTS-1378
        // if (isOrder.status === statuses.CANCELLED
        //     || (isOrder.paymentStatus === 'BALANCE_DUE' && isOrder.paymentTiming === 'PRE-PAY'
        //         && status !== 'CANCELLED' && !isOrder.isAdjusted)) {
        //     res.status(409).json({
        //         error: 'Can not update the status for an unpaid order.',
        //     });
        //     return;
        // }
        // only unpaid orders can be cancelled.
        if (isOrder.paymentStatus === 'PAID' && status === 'CANCELLED') {
            res.status(409).json({
                error: 'Can not cancel a paid order.',
            });
            return;
        }
        if (
            Object.values(statuses).includes(status) &&
            status === 'READY_FOR_PROCESSING' &&
            (isOrder.status === 'READY_FOR_PICKUP' || isOrder.status === 'COMPLETED')
        ) {
            res.status(409).json({
                error: `Order is currently in ${isOrder.status} state, so can not update it to ${status}`,
            });
            return;
        }
        if (
            Object.values(statuses).includes(status) &&
            status === 'PROCESSING' &&
            isOrder.status === 'COMPLETED'
        ) {
            res.status(409).json({
                error: `Order is currently in ${isOrder.status} state, so can not update it to ${status}`,
            });
            return;
        }
        if (
            Object.values(statuses).includes(status) &&
            status === 'READY_FOR_PICKUP' &&
            isOrder.status === 'READY_FOR_PROCESSING'
        ) {
            res.status(409).json({
                error: `Order is currently in ${isOrder.status} state, so can not update it to ${status}`,
            });
            return;
        }
        req.constants = {};
        if (status === statuses.DESIGNATED_FOR_PROCESSING_AT_HUB) {
            req.constants.hubId = req.currentStore.hubId;
            req.constants.isProcessedAtHub = true;
        } else if (isOrder.isProcessedAtHub) {
            req.constants.hubId = isOrder.hubId;
            req.constants.isProcessedAtHub = true;
        }
        req.constants.isOrder = isOrder;
        req.constants.currentStatus = isOrder.status;
        req.constants.isBagTrackingEnabled = isOrder.isBagTrackingEnabled;
        if (
            Object.values(statuses).includes(status) &&
            status === 'COMPLETED' &&
            (isOrder.status === 'READY_FOR_PROCESSING' || isOrder.status === 'PROCESSING')
        ) {
            res.status(409).json({
                error: `Order is currently in ${isOrder.status} state, so can not update it to ${status}`,
            });
            return;
        }
        if (
            Object.values(hubStatues).includes(status) &&
            isOrder.isProcessedAtHub &&
            status === 'RECEIVED_AT_HUB_FOR_PROCESSING' &&
            (isOrder.status === 'IN_TRANSIT_TO_HUB' || isOrder.status === 'HUB_PROCESSING_ORDER')
        ) {
            res.status(409).json({
                error: `Order is currently in ${isOrder.status} state, so can not update it to ${status}`,
            });
            return;
        }
        if (
            Object.values(hubStatues).includes(status) &&
            isOrder.isProcessedAtHub &&
            status === 'HUB_PROCESSING_COMPLETE' &&
            isOrder.status === 'HUB_PROCESSING_ORDER'
        ) {
            res.status(409).json({
                error: `Order is currently in ${isOrder.status} state, so can not update it to ${status}`,
            });
            return;
        }
        if (
            Object.values(hubStatues).includes(status) &&
            isOrder.isProcessedAtHub &&
            status === 'RECEIVED_AT_HUB_FOR_PROCESSING' &&
            isOrder.status === 'IN_TRANSIT_TO_STORE'
        ) {
            res.status(409).json({
                error: `Order is currently in ${isOrder.status} state, so can not update it to ${status}`,
            });
            return;
        }
        if (
            Object.values(hubStatues).includes(status) &&
            isOrder.isProcessedAtHub &&
            status === 'HUB_PROCESSING_ORDER' &&
            (isOrder.status === 'RECEIVED_AT_HUB_FOR_PROCESSING' ||
                isOrder.status === 'HUB_PROCESSING_COMPLETE')
        ) {
            res.status(409).json({
                error: `Order is currently in ${isOrder.status} state, so can not update it to ${status}`,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyRequest;
