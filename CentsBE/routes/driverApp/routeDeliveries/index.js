const router = require('express').Router();
const cancelRouteDeliveryValidation = require('../../../validations/driverApp/routeDeliveries/cancelRouteDeliveryValidation');
const cancelTheRouteDelivery = require('./cancelTheRouteDelivery');
const completePickupandDeliveryOrder = require('./completePickupandDeliveryOrder');
const completePickupandDeliveryOrderValidation = require('../../../validations/driverApp/route/completePickupandOrderDeliveryValidation');
const getOrdersForRouteDelivery = require('./getOrdersForRouteDelivery');
const completeStoreServiceOrder = require('./completeStoreServiceOrder');
const getRouteDeliveryInfo = require('./getRouteDeliveryInfo');
const completeStoreServiceOrderValidation = require('../../../validations/driverApp/completeStoreServiceOrder');
const updateETAForRouteDelivery = require('./updateETAForRouteDelivery');
const updateETAForRouteDeliveryValidation = require('../../../validations/driverApp/routeDeliveries/updateETAForRouteDeliveryValidation');

router.get('/:routeDeliveryId/orders', getOrdersForRouteDelivery);
router.post(
    '/:routeDeliveryId/service-orders/:serviceOrderId/complete',
    completeStoreServiceOrderValidation,
    completeStoreServiceOrder,
);
router.post(
    '/:routeDeliveryId/complete',
    completePickupandDeliveryOrderValidation,
    completePickupandDeliveryOrder,
);
router.post('/:routeDeliveryId/cancel', cancelRouteDeliveryValidation, cancelTheRouteDelivery);
router.post('/:routeDeliveryId/go', updateETAForRouteDeliveryValidation, updateETAForRouteDelivery);
router.get('/:routeDeliveryId', getRouteDeliveryInfo);

module.exports = exports = router;
