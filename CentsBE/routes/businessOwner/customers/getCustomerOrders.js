const CentsCustomer = require('../../../models/centsCustomer');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

async function getCustomerOrders(req, res, next) {
    try {
        const { id: centsCustomerId } = req.query;
        const { businessId } = req.constants;

        const selectFields = [
            'paymentStatus',
            'status',
            'orderTotal as totalAmount',
            'orderCode',
            'id',
            'createdAt',
        ];
        const orders = (
            await CentsCustomer.query()
                .withGraphFetched(
                    `[storeCustomers(storeCustomerFilter).[serviceOrders(serviceOrderFilter), inventoryOrders(inventoryOrderFilter)]]`,
                )
                .where({
                    id: centsCustomerId,
                })
                .modifiers({
                    storeCustomerFilter: (query) => {
                        query.where({
                            businessId,
                        });
                    },

                    serviceOrderFilter: (query) => {
                        query.select(...selectFields, 'orderType');
                    },

                    inventoryOrderFilter: (query) => {
                        query.select(...selectFields);
                    },
                })
                .first()
        ).storeCustomers.flatMap((storeCustomer) => {
            const serviceOrderDetails = storeCustomer.serviceOrders.map((serviceOrder) => ({
                ...serviceOrder,
                orderCodeWithPrefix: getOrderCodePrefix(serviceOrder),
            }));
            const inventoryOrderDetails = storeCustomer.inventoryOrders.map((inventoryOrder) => {
                const updatedInventoryOrder = {
                    ...inventoryOrder,
                    orderType: 'INVENTORY',
                };
                return {
                    ...updatedInventoryOrder,
                    orderCodeWithPrefix: getOrderCodePrefix(updatedInventoryOrder),
                };
            });
            return [...serviceOrderDetails, ...inventoryOrderDetails];
        });
        res.status(200).json({
            success: true,
            orders,
            totalOrders: orders.length,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = { getCustomerOrders };
