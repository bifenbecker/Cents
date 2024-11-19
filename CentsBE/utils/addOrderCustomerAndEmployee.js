const { raw } = require('objection');
const Order = require('../models/orders');
const Store = require('../models/store');
const BusinessSettings = require('../models/businessSettings');
const employeeDetailsQuery = require('../queryHelpers/employeeDetailsQuery');

async function getServiceOrderAndCustomerDetails(orderId) {
    const details = await Order.query()
        .select(
            'storeCustomers.phoneNumber as customerPhoneNumber',
            'storeCustomers.centsCustomerId as centsCustomerId',
            'storeCustomers.id as storeCustomerId',
            raw(
                'concat("storeCustomers"."firstName", \' \', "storeCustomers"."lastName") as "customerName"',
            ),
            'serviceOrders.status as status',
            'serviceOrders.paymentTiming as paymentTiming',
            'serviceOrders.orderType as orderType',
            'serviceOrders.storeId as storeId',
            'serviceOrders.promotionId as previousPromotionId',
            'serviceOrders.netOrderTotal as previousNetOrderTotal',
            'serviceOrders.orderTotal as previousOrderTotal',
            'serviceOrders.paymentStatus as previousPaymentStatus',
            raw('coalesce("serviceOrders"."creditAmount", 0) as "previousCreditAmount"'),
            raw('coalesce("serviceOrders"."tipAmount", 0) as "previousTipAmount"'),
            'serviceOrders.promotionAmount as previousPromotionAmount',
            'serviceOrders.balanceDue as previousBalanceDue',
            'serviceOrders.convenienceFee as previousConvenienceFee',
        )
        .join('serviceOrders', (builder) => {
            builder
                .on('serviceOrders.id', '=', 'orders.orderableId')
                .andOn('orders.orderableType', '=', raw("'ServiceOrder'"));
        })
        .join('storeCustomers', 'storeCustomers.id', 'serviceOrders.storeCustomerId')
        .where('orders.id', '=', orderId)
        .first();
    return details;
}

async function appendOrderCustomerAndEmployee(req, res, next) {
    try {
        const { orderId, employeeCode } = req.body;
        req.constants = req.constants || {};

        if (orderId) {
            const details = await getServiceOrderAndCustomerDetails(orderId);
            if (!details) {
                throw new Error('Service order not found');
            }
            const store = await Store.query().findById(details.storeId);
            const businessSettings = await BusinessSettings.query().findOne({
                businessId: store.businessId,
            });
            store.settings = businessSettings;
            req.currentStore = store;
            req.constants.currentOrderDetails = {
                ...details,
            };
        }

        if (employeeCode) {
            const employee = await employeeDetailsQuery(employeeCode, req.currentStore.businessId);
            const employeeDetails = {
                employeeCode,
                ...employee[0],
            };
            req.constants.employee = employeeDetails;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    appendOrderCustomerAndEmployee,
    getServiceOrderAndCustomerDetails,
};
