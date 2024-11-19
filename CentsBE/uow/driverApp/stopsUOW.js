const moment = require('moment-timezone');
const OrderDelivery = require('../../models/orderDelivery');
const deliveryWindowOuterWhereQuery = require('../../helpers/deliveryWindowOuterWhereQuery');
const getTimeStampRangeForTiming = require('../../utils/getTimeStampRangeForTiming');
const getOrderCodePrefix = require('../../utils/getOrderCodePrefix');

async function getStops(payload) {
    try {
        const { timing, transaction, date } = payload;
        const dateObj = date
            ? moment.tz(date, 'MM/DD/YYYY', timing.shift.store.settings.timeZone || 'UTC')
            : moment.tz(timing.shift.store.settings.timeZone || 'UTC');
        const range = getTimeStampRangeForTiming(
            dateObj.toDate(),
            timing,
            timing.shift.store.settings.timeZone,
        );

        const orderDeliveries = await OrderDelivery.query(transaction)
            .where('storeId', timing.shift.storeId)
            .where(deliveryWindowOuterWhereQuery(range))
            .where('timingsId', timing.id)
            .where('deliveryProvider', 'OWN_DRIVER')
            .withGraphFetched(
                '[routeDelivery(routeDelivery),centsCustomerAddress(centsCustomerAddress),order(order).[serviceOrder(serviceOrder).[serviceOrderBags(bags)]]]',
            )
            .modifiers({
                order: (query) => {
                    query.whereIn('orders.orderableType', ['ServiceOrder', 'serviceOrder']);
                },
                routeDelivery: (query) => {
                    query.orderBy('createdAt', 'desc').first();
                },
                bags: (query) => {
                    query.select('id', 'barcodeStatus');
                },
                serviceOrder: (query) => {
                    query.select('id', 'orderCode', 'orderType');
                },
                centsCustomerAddress: (query) => {
                    query.select('address1', 'address2', 'city', 'firstLevelSubdivisionCode');
                },
            })
            .orderBy('id');

        const stops = [];
        orderDeliveries.forEach((orderDelivery) => {
            stops.push({
                id: orderDelivery.id,
                status: orderDelivery.status,
                routeDeliveryId: orderDelivery.routeDelivery.length
                    ? orderDelivery.routeDelivery[0].id
                    : null,
                customerName: orderDelivery.customerName,
                orderCode: orderDelivery.order.serviceOrder
                    ? getOrderCodePrefix({
                          orderCode: orderDelivery.order.serviceOrder.orderCode,
                          orderType: orderDelivery.order.serviceOrder.orderType,
                      })
                    : null,
                bagCount: orderDelivery.order.serviceOrder.serviceOrderBags
                    ? orderDelivery.order.serviceOrder.serviceOrderBags.length
                    : 0,
                address: {
                    address1: orderDelivery.centsCustomerAddress.address1
                        ? orderDelivery.centsCustomerAddress.address1
                        : null,
                    address2: orderDelivery.centsCustomerAddress.address2
                        ? orderDelivery.centsCustomerAddress.address2
                        : null,
                    city: orderDelivery.centsCustomerAddress.city
                        ? orderDelivery.centsCustomerAddress.city
                        : null,
                    firstLevelSubdivisionCode: orderDelivery.centsCustomerAddress
                        .firstLevelSubdivisionCode
                        ? orderDelivery.centsCustomerAddress.firstLevelSubdivisionCode
                        : null,
                },
                type: orderDelivery.type,
            });
        });
        return { ...payload, stops, storeId: timing.shift.storeId };
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = getStops;
