const ServiceOrder = require('../../models/serviceOrders');
const { mapResponse } = require('./mapResponseUOW');
const serviceOrderTurnList = require('../machines/turnList/getServiceOrderTurnListUOW');

async function getSingleOrderLogic(orderId, currentStore, version, cents20LdFlag) {
    try {
        let graphFetchedString = `[orderItems.[referenceItems as refItem.[servicePrice, inventoryItem,
                 lineItemDetail.[modifierLineItems]]],
                 storeCustomer(userDetails).[centsCustomer(centsCustomerDetails)],
                 notificationLogs(reverse).[language],
                 serviceOrderBags(ascending),
                 activityLog(activityLog),
                 serviceOrderRecurringSubscription as subscription.[recurringSubscription]
                 weightLogs(weightFilter).[editedByTeamMember(teamMemberFilter).[user(userFilter)]]
                 order as orderMaster.[payments(payments), promotionDetails, delivery, pickup],
                 store(filterDetails).[settings],
                 hub(filterDetails), convenienceFeeDetails(serviceFee), tier]`;

        if (version >= '2.0.0' && cents20LdFlag) {
            graphFetchedString = `[orderItems.[referenceItems as refItem.[servicePrice, inventoryItem,
                 lineItemDetail.[modifierLineItems]]],
                 storeCustomer(userDetails).[centsCustomer(centsCustomerDetails)],
                 notificationLogs(reverse).[language],
                 serviceOrderBags(ascending, notDeleted),
                 hangerBundles(ascending, notDeleted),
                 storageRacks(ascending, notDeleted),
                 activityLog(activityLog),
                 serviceOrderRecurringSubscription as subscription.[recurringSubscription]
                 weightLogs(weightFilter).[editedByTeamMember(teamMemberFilter).[user(userFilter)]]
                 order as orderMaster.[payments(payments), promotionDetails, delivery, pickup],
                 store(filterDetails).[settings],
                 hub(filterDetails), convenienceFeeDetails(serviceFee), tier]`;
        }

        let order = ServiceOrder.query()
            .where(`${ServiceOrder.tableName}.id`, orderId)
            .withGraphFetched(graphFetchedString)
            .modifiers({
                notDeleted: (query) => {
                    query.where('deletedAt', null);
                },
                ascending: (query) => {
                    query.orderBy('id', 'asc');
                },
                reverse: (query) => {
                    query.orderBy('id', 'desc');
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
                            'isAdjusted',
                            'adjustedBy',
                        )
                        .orderBy('id');
                },
                filterDetails: (query) => {
                    query
                        .select(
                            'id',
                            'name',
                            'address',
                            'city',
                            'state',
                            'zipCode',
                            'phoneNumber',
                            'stripeLocationId',
                            'dcaLicense',
                            'businessId',
                            'commercialDcaLicense',
                        )
                        .where('businessId', currentStore.businessId);
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
                userDetails: (query) => {
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
                centsCustomerDetails: (query) => {
                    query.select(
                        'id',
                        'firstName',
                        'lastName',
                        'phoneNumber',
                        'email',
                        'stripeCustomerId',
                    );
                },
                teamMemberFilter: (query) => {
                    query.select('id');
                },
                userFilter: (query) => {
                    query.select('firstname', 'lastname');
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
                            'changeDue',
                            'tax',
                            'createdAt',
                            'updatedAt',
                        )
                        .orderBy('id');
                },
                serviceFee: (query) => {
                    query.select('fee');
                },
            })
            .first();
        order = currentStore.id
            ? order.andWhere((q) => {
                  q.where(`${ServiceOrder.tableName}.storeId`, currentStore.id).orWhere(
                      `${ServiceOrder.tableName}.hubId`,
                      currentStore.id,
                  );
              })
            : order;
        order = await order;
        const orderDetails = order
            ? await mapResponse(order, currentStore, version, cents20LdFlag)
            : [];
        orderDetails.turns = await serviceOrderTurnList({ serviceOrderId: orderId });
        return orderDetails;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getSingleOrderLogic;
