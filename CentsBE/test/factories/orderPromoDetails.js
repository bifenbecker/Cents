const { factory } = require('factory-girl');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
const OrderPromoDetail = require('../../models/orderPromoDetail');

require('./orders');

factory.define(FN.orderPromoDetail, OrderPromoDetail, {
    orderId: factory.assoc(FN.order, 'id'),
});

module.exports = exports = factory;
