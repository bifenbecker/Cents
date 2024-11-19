const ServiceOrder = require('../../../models/serviceOrders');
const Store = require('../../../models/store');
const TeamMember = require('../../../models/teamMember');

const getEmployee = async (employeeCode) => {
    const teamMember = await TeamMember.query().findById(employeeCode);
    return teamMember.userId;
};

const mapIndividualOrder = async (order) => {
    const response = {};
    response.id = order.id;
    response.status = order.status;
    response.placedAt = order.placedAt;
    response.totalAmount = order.orderTotal;
    response.paymentStatus = order.paymentStatus;
    response.isBagTrackingEnabled = order.isBagTrackingEnabled;
    response.notes = order.notes ? order.notes : '';
    response.isProcessedAtHub = order.isProcessedAtHub;
    response.customerName = `${order.storeCustomer.firstName} ${order.storeCustomer.lastName}`;
    response.employeeCode = await getEmployee(order.employeeCode);
    response.payments = order.payments ? order.payments : {};
    const orderItems = [];

    for (const item of order.orderItems) {
        const temp = {};
        if (item.refItem.length) {
            temp.orderItemId = item.id;
            const { lineItemDetail } = item.refItem[0];
            temp.count = lineItemDetail.lineItemQuantity || null;
            temp.itemTotal = lineItemDetail.lineItemTotalCost || null;
            temp.serviceCategory =
                lineItemDetail.soldItemType === 'InventoryItem' ? null : lineItemDetail.category;
            temp.category = lineItemDetail.category;
            temp.isService = !!temp.serviceCategory;
            temp.price = lineItemDetail.lineItemUnitCost;
            temp.laundryType = lineItemDetail.lineItemName;
            temp.servicePriceId =
                lineItemDetail.soldItemType === 'ServicePrices' ? lineItemDetail.soldItemId : null;
            temp.inventoryItemId =
                lineItemDetail.soldItemType === 'InventoryItem' ? lineItemDetail.soldItemId : null;
            temp.serviceId =
                lineItemDetail.soldItemType === 'ServicesMaster' ? lineItemDetail.soldItemId : null;
            temp.minimumQuantity = lineItemDetail.lineItemMinQuantity;
            temp.minimumPrice = lineItemDetail.lineItemMinPrice;
            if (item.refItem[0].weightLog.length) {
                const firstMeasurement = item.refItem[0].weightLog.find(
                    (weightLog) => weightLog.step === 1,
                );
                temp.totalWeight = firstMeasurement.totalWeight;
            }
            temp.weightLogs = item.refItem[0].weightLog;
        }
        orderItems.push(temp);
    }

    response.orderItems = orderItems;
    return response;
};

const mapOrders = async (orders) => {
    if (!orders.length) {
        return [];
    }
    const response = [];
    for (const order of orders) {
        response.push(mapIndividualOrder(order));
    }
    return Promise.all(response);
};

const allOrders = async (req, res, next) => {
    try {
        const { storeId } = req.query;
        const store = await Store.query().findById(storeId);

        let orders = await ServiceOrder.query()
            .withGraphJoined(
                `[orderItems.[referenceItems as refItem.[
                weightLog(weightFilter),lineItemDetail]], 
                storeCustomer(storeCustomerDetails),
                payments(payments)
                ,store(filterDetails)]`,
            )
            .modifiers({
                reverse: (query) => {
                    query.orderBy('id', 'desc');
                },
                currentBusiness: (query) => {
                    query.where('businessId', store.businessId);
                },
                storeCustomerDetails: (query) => {
                    query.select('id', 'firstName', 'lastName');
                },
                filterDetails: (query) => {
                    query.select(
                        'id',
                        'name',
                        'address',
                        'city',
                        'state',
                        'zipCode',
                        'phoneNumber',
                        'stripeLocationId',
                        'dcaLicense',
                        'commercialDcaLicense',
                    );
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
                        )
                        .orderBy('id');
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
                payments: (query) => {
                    query
                        .select(
                            'id',
                            'orderId',
                            'paymentToken',
                            'status',
                            'totalAmount',
                            'stripeClientSecret',
                            'paymentProcessor',
                            'paymentMemo',
                            'esdReceiptNumber',
                        )
                        .orderBy('id');
                },
            })
            .orderBy(`${ServiceOrder.tableName}.id`, 'desc')
            .where(`${ServiceOrder.tableName}.storeId`, storeId);

        orders = await orders;
        const mappedOrders = await mapOrders(orders);

        return res.json({
            orders: mappedOrders,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = allOrders;
