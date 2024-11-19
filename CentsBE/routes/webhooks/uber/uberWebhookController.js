const { transaction } = require('objection');
const { origins } = require('../../../constants/constants');

const OrderDelivery = require('../../../models/orderDelivery');

const completeUberDeliveryPipeline = require('../../../pipeline/delivery/uber/completeUberDeliveryPipeline');
const updateUberDeliveryPipeline = require('../../../pipeline/delivery/uber/updateUberDeliveryPipeline');

/**
 * Determine the updated Uber delivery status and update the OrderDelivery accordingly.
 *
 * Possible Uber statuses are:
 *
 * 1) SCHEDULED
 * 2) EN_ROUTE_TO_PICKUP
 * 3) ARRIVED_AT_PICKUP
 * 4) EN_ROUTE_TO_DROP_OFF
 * 5) ARRIVED_AT_DROPOFF
 * 6) COMPLETED
 * 7) FAILED
 *
 * Desired functionality and rules are as follows:
 *
 * 1) If status is anything except COMPLETED, just update the status of the OrderDelivery
 * 2) If status is COMPLETED, run the finishUberDelivery pipeline which performs the following:
 *    a) Get authorization token from Uber;
 *    b) Call getDeliveryStatus API from Uber;
 *    c) Updates the status and fee information for the OrderDelivery;
 *    d) Captures the payment that was authorized during delivery creation;
 *    e) Marks the ServiceOrder as complete
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateDeliveryStatus(req, res, next) {
    let trx = null;

    try {
        const { meta } = req.body;
        const { status } = meta;

        switch (status) {
            case 'COMPLETED': {
                const completePayload = {
                    thirdPartyDeliveryId: meta.order_id,
                    deliveryProvider: 'UBER',
                    status,
                    origin: origins.DRIVER_APP,
                };
                const completeOutput = await completeUberDeliveryPipeline(completePayload);

                return res.json({
                    success: true,
                    output: completeOutput,
                });
            }

            case 'EN_ROUTE_TO_DROP_OFF': {
                const updatePayload = {
                    thirdPartyDeliveryId: meta.order_id,
                    status,
                    deliveryProvider: 'UBER',
                    origin: origins.DRIVER_APP,
                };
                const updateOutput = await updateUberDeliveryPipeline(updatePayload);

                return res.json({
                    success: true,
                    output: updateOutput,
                });
            }

            case 'SCHEDULED':
            case 'EN_ROUTE_TO_PICKUP':
            case 'ARRIVED_AT_PICKUP':
            case 'ARRIVED_AT_DROPOFF':
            case 'FAILED': {
                trx = await transaction.start(OrderDelivery.knex());

                const updatedOrderDelivery = await OrderDelivery.query(trx)
                    .patch({ status })
                    .where({
                        thirdPartyDeliveryId: meta.order_id,
                    });

                await trx.commit();

                return res.json({
                    orderDelivery: updatedOrderDelivery,
                    success: true,
                });
            }

            default: {
                trx = await transaction.start(OrderDelivery.knex());

                const defaultOrderDelivery = await OrderDelivery.query(trx)
                    .patch({ status })
                    .where({
                        thirdPartyDeliveryId: meta.order_id,
                    });

                await trx.commit();

                return res.json({
                    orderDelivery: defaultOrderDelivery,
                    success: true,
                });
            }
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = { updateDeliveryStatus };
