const { factory } = require('factory-girl');
const ServiceOrderItems = require('../../models/serviceOrderItem');
require('./serviceOrders');
require('./serviceReferenceItems');
require('./serviceReferenceItemDetail');

factory.define('serviceOrderItem', ServiceOrderItems, {
    price: 10,
    orderId: factory.assoc('serviceOrder', 'id'),
});

factory.extend(
    'serviceOrderItem',
    'serviceOrderItemsWithReferenceItems',
    {},
    {
        afterCreate: async (model) => {
            const referenceItem = await factory.create('serviceReferenceItem', {
                orderItemId: model.id,
            });

            await factory.create(
                'serviceReferenceItemDetailForServicePrices',
                {
                    serviceReferenceItemId: referenceItem.id,
                    lineItemTotalCost: referenceItem.quantity * referenceItem.unitCost,
                    lineItemQuantity: referenceItem.quantity,
                    lineItemUnitCost: referenceItem.unitCost,
                },
            );
            return model;
        },
    },
);

module.exports = exports = factory;
