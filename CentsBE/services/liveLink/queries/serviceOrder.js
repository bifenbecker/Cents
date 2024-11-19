const { raw } = require('objection');
const find = require('lodash/find');
const ServiceOrder = require('../../../models/serviceOrders');
const StoreCustomer = require('../../../models/storeCustomer');
const OrderDelivaryConstants = require('../../../constants/constants');

const { getSettings } = require('./stores');

const { mapServiceOrder } = require('../responseMappers/serviceOrder');
const TimelineBuilder = require('../timeline/timelineBuilder');

function getOrderDetailsQuery(id) {
    const order = ServiceOrder.query()
        .select(
            'serviceOrders.id as id',
            'serviceOrders.orderTotal as orderTotal',
            'serviceOrders.netOrderTotal as netOrderTotal',
            'serviceOrders.promotionAmount as promotionAmount',
            'serviceOrders.creditAmount as creditAmount',
            'serviceOrders.tipAmount as tipAmount',
            'serviceOrders.tipOption as previousTipOption',
            'serviceOrders.taxAmountInCents as taxAmountInCents',
            'serviceOrders.status as status',
            'orders.id as masterOrderId',
            'serviceOrders.storeId as storeId',
            'serviceOrders.balanceDue as balanceDue',
            'serviceOrders.promotionId as promotionId',
            'serviceOrders.paymentStatus as paymentStatus',
            'serviceOrders.orderType',
            'serviceOrders.employeeCode',
            'serviceOrders.convenienceFee',
            'serviceOrders.convenienceFeeId',
            'serviceOrders.pickupDeliveryFee as pickupDeliveryFee',
            'serviceOrders.pickupDeliveryTip as pickupDeliveryTip',
            'serviceOrders.returnDeliveryFee as returnDeliveryFee',
            'serviceOrders.returnDeliveryTip as returnDeliveryTip',
        )
        .join('orders', (query) => {
            query
                .on('orderableType', '=', raw("'ServiceOrder'"))
                .andOn('orderableId', '=', 'serviceOrders.id');
        })
        .where('serviceOrders.id', id);
    return order;
}

function joinStoreCustomerAndServiceOrder(queryInstance) {
    let builder = queryInstance;
    builder = builder
        .select(
            'storeCustomers.id as storeCustomerId',
            'storeCustomers.phoneNumber as storeCustomerPhone',
            'storeCustomers.centsCustomerId as centsCustomerId',
            'storeCustomers.creditAmount as availableCredits',
            'storeCustomers.businessId as businessId',
            'storeCustomers.firstName as firstName',
            'storeCustomers.lastName as lastName',
            'storeCustomers.phoneNumber as phoneNumber',
            'storeCustomers.email as email',
            'storeCustomers.isHangDrySelected',
            'storeCustomers.hangDryInstructions',
        )
        .join('storeCustomers', 'storeCustomers.id', 'serviceOrders.storeCustomerId');
    return builder;
}

function addWhereClause(query, column, value) {
    return query.where(column, value);
}

async function getCustomerAndOrder(orderId, customerId) {
    let order = getOrderDetailsQuery(orderId);
    order = joinStoreCustomerAndServiceOrder(order);
    order = addWhereClause(order, 'storeCustomers.centsCustomerId', customerId);
    order = await order.first();
    return order;
}

async function getCustomer(orderId) {
    const customer = await StoreCustomer.query()
        .select('phoneNumber', 'centsCustomerId', 'firstName', 'lastName')
        .join('serviceOrders', 'serviceOrders.storeCustomerId', 'storeCustomers.id')
        .where('serviceOrders.id', orderId)
        .first();
    return customer;
}

async function getOrderDetails(serviceOrderId, trx) {
    const order = await ServiceOrder.query(trx)
        .where(`${ServiceOrder.tableName}.id`, serviceOrderId)
        .withGraphJoined(
            `[orderItems(orderItems).[referenceItems as refItem.[servicePrice, inventoryItem,
        lineItemDetail as li.[modifierLineItems as ml]]],
        storeCustomer(storeCustomerDetails).[centsCustomer(userDetails).[paymentMethods]],
        store(filterDetails).[settings(filterStoreSettings)],
        hub(filterDetails),
        weightLogs(weightFilter),
        order as parentOrder.[promotionDetails(promotionSelect), delivery, pickup, payments(paymentFilter) as payment],
        activityLog(activityLog),
        serviceOrderRecurringSubscription as subscription.[recurringSubscription]
    ]`,
        )
        .modifiers({
            orderItems: (query) => {
                query.whereNull('deletedAt');
            },
            weightFilter: (query) => {
                query
                    .select(
                        'id',
                        'totalWeight',
                        'chargeableWeight',
                        'referenceItemId',
                        'step',
                        'status',
                        'teamMemberId',
                        'editReason',
                        'isEdited',
                        'updatedAt',
                    )
                    .orderBy('id');
            },
            promotionFilter: (query) => {
                query.select(
                    'promotionType',
                    'discountValue',
                    'balanceRule',
                    'redemptionRule',
                    'name',
                );
            },
            filterDetails: (query) => {
                query.select(
                    'name',
                    'address',
                    'city',
                    'state',
                    'zipCode',
                    'uberStoreUuid',
                    'id',
                    'businessId',
                    'phoneNumber',
                    'dcaLicense',
                    'commercialDcaLicense',
                );
            },
            filterStoreSettings: (query) => {
                query.select('timeZone');
            },
            userDetails: (query) => {
                query.select(
                    'id',
                    'firstName',
                    'lastName',
                    'phoneNumber',
                    'email',
                    'stripeCustomerId',
                );
            },
            storeCustomerDetails: (query) => {
                query.select(
                    'id',
                    'firstName',
                    'lastName',
                    'phoneNumber',
                    'email',
                    'creditAmount',
                    'notes',
                    'isHangDrySelected',
                    'hangDryInstructions',
                );
            },
            promotionSelect: (query) => {
                query.select('promoDetails', 'itemIds');
            },
            paymentFilter: (query) => {
                query
                    .select(
                        'id',
                        'status',
                        'totalAmount',
                        'paymentToken',
                        'paymentProcessor',
                        'stripeClientSecret',
                    )
                    .where({
                        paymentProcessor: 'stripe',
                    })
                    .orderBy('createdAt', 'desc')
                    .first();
            },
            activityLog: (query) => {
                query.select(
                    'id',
                    'status',
                    'employeeCode',
                    'employeeName',
                    'updatedAt',
                    'teamMemberId',
                    'notes',
                );
            },
        })
        .first();
    const mappedOrder = await mapServiceOrder(order);
    mappedOrder.timeline = await new TimelineBuilder(order).build();
    const { store } = order;
    const settings = await getSettings(store.id, store.businessId, trx);
    mappedOrder.originStoreName = store.name;
    mappedOrder.store.settings = settings;

    // Order Intake check

    const orderIntake = order.activityLog.find((activity) => {
        if (order.orderType === 'RESIDENTIAL') {
            return (
                activity.status === 'READY_FOR_PROCESSING' ||
                activity.status === 'HUB_PROCESSING_ORDER' ||
                activity.status === 'DROPPED_OFF_AT_HUB'
            );
        }
        return (
            activity.status === 'READY_FOR_PROCESSING' ||
            activity.status === 'DESIGNATED_FOR_PROCESSING_AT_HUB'
        );
    });
    mappedOrder.isIntakeComplete = !!orderIntake;
    mappedOrder.intakeCompletedAt = orderIntake ? orderIntake.updatedAt : null;

    // isProcessingCompleted READY_FOR_PICKUP

    const processedOrder = find(order.activityLog, {
        status: OrderDelivaryConstants.statuses.READY_FOR_PICKUP,
    });
    mappedOrder.isProcessingCompleted = !!processedOrder;

    // Customer Notes

    mappedOrder.orderNotes = order.notes;
    mappedOrder.customerNotes = order.storeCustomer.notes;

    return mappedOrder;
}

async function getLatestServiceOrder(centsCustomerId, transaction) {
    const order = ServiceOrder.query(transaction)
        .select('serviceOrders.id as id')
        .join('storeCustomers', 'storeCustomers.id', 'serviceOrders.storeCustomerId')
        .where('storeCustomers.centsCustomerId', centsCustomerId)
        .orderBy('serviceOrders.id', 'desc')
        .limit(1)
        .first();
    return order;
}

module.exports = exports = {
    getCustomerAndOrder,
    getCustomer,
    getOrderDetails,
    getLatestServiceOrder,
};
