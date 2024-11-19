const ServiceReferenceItem = require('../../../models/serviceReferenceItem');
const ServiceOrderItem = require('../../../models/serviceOrderItem');
const ServiceOrder = require('../../../models/serviceOrders');

async function verifyCustomerDiscountService(req, res, next) {
    try {
        const { customerId } = req.query;

        const customerReferenceItems = await ServiceReferenceItem.query()
            .select(
                'serviceReferenceItems.id as referenceItemId',
                'serviceReferenceItems.serviceId as serviceId',
                'serviceReferenceItems.servicePriceId as servicePriceId',
                'servicesMaster.name as serviceName',
                'servicesMaster.description as serviceDescription',
            )
            .join(
                `${ServiceOrderItem.tableName} as orderItems`,
                'orderItems.id',
                'serviceReferenceItems.orderItemId',
            )
            .join('servicePrices', 'servicePrices.id', 'serviceReferenceItems.servicePriceId')
            .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
            .join(`${ServiceOrder.tableName} as orders`, 'orders.id', 'orderItems.orderId')
            .where({
                'orders.storeCustomerId': customerId,
            })
            .andWhere((builder) => {
                builder
                    .where('servicesMaster.name', 'ilike', '%Discount%')
                    .andWhere('orders.status', '!=', 'CANCELLED');
            });
        res.status(200).json({
            success: true,
            customerReferenceItems,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyCustomerDiscountService;
