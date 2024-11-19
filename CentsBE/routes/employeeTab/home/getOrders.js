const ServiceOrder = require('../../../models/serviceOrders');
const { mapResponse } = require('../../../uow/singleOrder/mapResponseUOW');

async function mapOrders(orders, currentStore) {
    if (!orders.length) {
        return [];
    }
    const response = [];
    for (const order of orders) {
        response.push(mapResponse(order, currentStore));
    }
    return Promise.all(response);
}

async function getActiveOrders(req, res, next) {
    try {
        const { isHub } = req.currentStore;
        const { statuses, status, orderBy } = req.query;
        const storeId = req.currentStore.id;
        // TODO test
        let orders = ServiceOrder.query()
            .withGraphJoined(
                `[orderItems.[referenceItems as refItem.[
            weightLog(weightFilter),lineItemDetail]],
            storeCustomer(userDetails).[centsCustomer(userDetails)],
            notificationLogs(reverse).[language],
            serviceOrderBags,
            activityLog(activityLog),
            order as orderMaster.[payments(payments)],
            store(filterDetails),hub(filterDetails)]`,
            )
            .modifiers({
                reverse: (query) => {
                    query.orderBy('id', 'desc');
                },
                userDetails: (query) => {
                    query.select(
                        'id',
                        'firstName',
                        'lastName',
                        'phoneNumber',
                        'email',
                        'languageId',
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
                            'esdReceiptNumber',
                            'paymentProcessor',
                            'paymentMemo',
                        )
                        .orderBy('id');
                },
            });
        orders =
            orderBy === 'location'
                ? orders.orderBy('store.name', 'asc')
                : orders.orderBy(`${ServiceOrder.tableName}.id`, 'desc');
        orders = isHub
            ? orders.where((q) => {
                  q.where(`${ServiceOrder.tableName}.storeId`, storeId).orWhere(
                      `${ServiceOrder.tableName}.hubId`,
                      storeId,
                  );
              })
            : orders.where(`${ServiceOrder.tableName}.storeId`, storeId);
        if (statuses && statuses.length) {
            // apply statuses
            orders = orders.whereIn(`${ServiceOrder.tableName}.status`, statuses);
        } else if (status && status.length) {
            // apply statuses
            orders = orders.whereIn(`${ServiceOrder.tableName}.status`, status.split(','));
        } else {
            orders = orders.andWhere(`${ServiceOrder.tableName}.status`, '<>', 'COMPLETED');
        }
        orders = await orders;
        const mappedOrders = await mapOrders(orders, req.currentStore);
        const { orderHistory } = req.query;
        if (orderHistory) {
            res.status(200).json({
                success: true,
                orders: mappedOrders,
            });
            return;
        }

        res.status(200).json({
            success: true,
            activeOrders: mappedOrders,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getActiveOrders;
