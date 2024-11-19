// packages
const { transaction } = require('objection');

// Models
const OrderDelivery = require('../../../models/orderDelivery');
const ServiceOrder = require('../../../models/serviceOrders');

// Constants and Utils
const {
    doorDashWebhookEventStatuses,
    origins,
    orderDeliveryStatuses,
} = require('../../../constants/constants');
const eventEmitter = require('../../../config/eventEmitter');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const { findStoreById } = require('../../../elasticsearch/store/queries');
const { getThirdPartyDeliveryFeeDetails } = require('../../../utils/getOrderDeliveryFeeDetails');
// Pipelines
const updateDoorDashDeliveryPipeline = require('../../../pipeline/doordash/updateDoorDashDeliveryPipeline');
const completeDoorDashDeliveryPipeline = require('../../../pipeline/doordash/completeDoorDashDeliveryPipeline');
const updateDoorDashPickupPipeline = require('../../../pipeline/doordash/updateDoorDashPickupPipeline');
const cancelDoorDashDeliveryPipeline = require('../../../pipeline/doordash/cancelDoorDashDeliveryPipeline');
const cancelPickupOrderPipeline = require('../../../pipeline/driverApp/cancelPickupOrderPipeline');

/**
 * Process an incoming DoorDash event webhook and update various models accordingly;
 *
 * Based on the event_category and delivery status, we pass the payload to various sub-functions
 * that end up running their own pipelines accordingly
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateDoorDashDeliveryStatus(req, res, next) {
    let trx = null;

    try {
        LoggerHandler('info', 'doordash delivery status update msg received', req);

        const { delivery, event_category: eventCategory } = req.body;
        const orderDelivery = await OrderDelivery.query()
            .withGraphFetched('order.[serviceOrder]')
            .findOne({
                deliveryProvider: 'DOORDASH',
                thirdPartyDeliveryId: delivery.id,
            });
        const { storeId, orderType, storeCustomerId } = orderDelivery.order.serviceOrder;
        const store = await findStoreById(storeId);
        const { totalDeliveryCost, subsidyInCents, thirdPartyDeliveryCostInCents } =
            getThirdPartyDeliveryFeeDetails({
                settings: store,
                orderType,
                type: orderDelivery.type,
                thirdPartyDelivery: delivery,
            });
        const payload = {
            orderDelivery,
            status: null,
            deliveryProvider: 'DOORDASH',
            thirdPartyDeliveryId: delivery.id,
            newTotalDeliveryCost: totalDeliveryCost,
            previousTotalDeliveryCost: orderDelivery.totalDeliveryCost,
            origin: origins.DRIVER_APP,
            subsidyInCents,
            thirdPartyDeliveryCostInCents,
            id: orderDelivery.id,
        };
        let message = null;
        let updatedOutput = null;
        let updatedOrderDelivery = null;
        let serviceOrder = null;
        let pipeline = updateDoorDashPickupPipeline;

        if (orderDelivery.type === 'RETURN') {
            pipeline = updateDoorDashDeliveryPipeline;
        }

        LoggerHandler('info', 'doordash delivery status update payload', {
            eventCategory,
            ...payload,
        });

        switch (eventCategory) {
            case 'dasher_confirmed':
                trx = await transaction.start(OrderDelivery.knex());

                updatedOrderDelivery = await OrderDelivery.query(trx)
                    .patch({ status: doorDashWebhookEventStatuses.dasher_confirmed })
                    .where({
                        thirdPartyDeliveryId: delivery.id,
                    })
                    .returning('*')
                    .first();

                payload.orderDelivery = updatedOrderDelivery;

                await trx.commit();

                return res.json({
                    orderDelivery: updatedOrderDelivery,
                    success: true,
                });

            case 'dasher_enroute_to_pickup':
                payload.status = doorDashWebhookEventStatuses.dasher_enroute_to_pickup;
                updatedOutput = await pipeline(payload);
                updatedOutput.thirdPartyDelivery = delivery;

                if (payload.status !== orderDelivery.status) {
                    eventEmitter.emit('doorDashDeliveryUpdate', updatedOutput);
                }

                return res.json({
                    success: true,
                    output: updatedOutput,
                });

            case 'dasher_confirmed_store_arrival':
                payload.status = doorDashWebhookEventStatuses.dasher_confirmed_store_arrival;
                updatedOutput = await pipeline(payload);

                return res.json({
                    success: true,
                    output: updatedOutput,
                });

            case 'dasher_picked_up':
                payload.status = doorDashWebhookEventStatuses.dasher_picked_up;
                updatedOutput = await pipeline(payload);
                updatedOutput.thirdPartyDelivery = delivery;

                if (payload.status !== orderDelivery.status) {
                    eventEmitter.emit('doorDashDeliveryUpdate', updatedOutput);
                }

                return res.json({
                    success: true,
                    output: updatedOutput,
                });

            case 'dasher_enroute_to_dropoff':
                payload.status = doorDashWebhookEventStatuses.dasher_enroute_to_dropoff;
                updatedOutput = await pipeline(payload);
                updatedOutput.thirdPartyDelivery = delivery;

                if (payload.status !== orderDelivery.status) {
                    eventEmitter.emit('doorDashDeliveryUpdate', updatedOutput);
                }

                return res.json({
                    success: true,
                    output: updatedOutput,
                });

            case 'dasher_confirmed_consumer_arrival':
                payload.status = doorDashWebhookEventStatuses.dasher_confirmed_consumer_arrival;
                updatedOutput = await pipeline(payload);

                return res.json({
                    success: true,
                    output: updatedOutput,
                });

            case 'dasher_dropped_off':
                payload.status = doorDashWebhookEventStatuses.dasher_dropped_off;
                updatedOutput = await completeDoorDashDeliveryPipeline(payload);
                updatedOutput.thirdPartyDelivery = delivery;

                if (payload.status !== orderDelivery.status) {
                    eventEmitter.emit('doorDashDeliveryUpdate', updatedOutput);
                }

                return res.json({
                    success: true,
                    output: updatedOutput,
                });

            case 'delivery_cancelled': {
                payload.status = doorDashWebhookEventStatuses.delivery_cancelled;
                payload.fromWebhook = true;
                payload.orderDeliveryId = orderDelivery.id;

                // Skip the remaining pipeline if the order delivery is already cancelled
                const existingOrderDelivery = await OrderDelivery.query().findById(
                    payload.orderDeliveryId,
                );
                if (existingOrderDelivery.status === orderDeliveryStatuses.CANCELED) {
                    return res.json({
                        success: true,
                        output: {
                            message: 'Order delivery already cancelled',
                        },
                    });
                }

                serviceOrder = await ServiceOrder.query()
                    .withGraphFetched('[orderItems.[referenceItems.[lineItemDetail]]]')
                    .findById(orderDelivery.order.orderableId);
                payload.serviceOrder = serviceOrder;
                payload.cancellationReason = 'CANCELED_VIA_DOORDASH';

                if (orderDelivery.type === 'RETURN') {
                    updatedOutput = await cancelDoorDashDeliveryPipeline(payload);
                } else {
                    updatedOutput = await cancelPickupOrderPipeline(payload);
                }

                if (payload.status !== orderDelivery.status) {
                    eventEmitter.emit('doorDashDeliveryUpdate', updatedOutput);
                }

                return res.json({
                    success: true,
                    output: updatedOutput,
                });
            }

            case 'delivery_attempted':
                message = 'dasher was unable to deliver';
                break;

            default:
                message = `delivery status is: ${delivery.status}`;
                break;
        }

        eventEmitter.emit('indexCustomer', storeCustomerId);

        return res.json({
            success: true,
            message,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error, req);
        return next(error);
    }
}

module.exports = exports = { updateDoorDashDeliveryStatus };
