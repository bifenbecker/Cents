const momenttz = require('moment-timezone');
const ServiceOrder = require('../../../models/serviceOrders');
const getBusiness = require('../../../utils/getBusiness');
const TeamMember = require('../../../models/teamMember');
const InventoryOrder = require('../../../models/inventoryOrders');
const assignedStoreIds = require('../../../utils/getAssignedStoreIds');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const {
    getFormattedStartAndEndDates,
    mapInventoryOrderDetails,
} = require('../../../utils/reports/reportsUtils');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

async function getOrdersReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        if (!business) {
            const errMsg = 'Invalid request. No business exists';
            LoggerHandler('error', errMsg, req);
            return res.status(400).json({
                error: errMsg,
            });
        }
        const queryParams = req.query;
        const { startDate, endDate, tz } = queryParams;
        const allStoresChecked = queryParams.allStoresCheck === 'true';
        let allStoreIds = [];
        if (allStoresChecked) {
            allStoreIds = await assignedStoreIds(
                req.teamMemberId,
                req.currentUser.role,
                business.id,
            );
            if (!allStoreIds.length) {
                throw new Error('No assigned Locations');
            }
        }

        let orders = ServiceOrder.query()
            .eagerAlgorithm(ServiceOrder.JoinEagerAlgorithm)
            .eager(
                `[
                    orderItems(orderItemDetails).[
                        referenceItems(referenceItemDetails) as refItem.[
                            weightLog(wlDetails),
                            servicePrice(servPriceDetails) as servPrice
                                .[service(serviceDetails).[serviceCategory(categoryDetails) as categories]],
                            service$(serviceDetails) as serv.[serviceCategory(categoryDetails) as categories],

                            inventoryItem(inventoryItemDetails) as inventoryItem
                                .[inventory(inventoryDetails)]
                        ]
                    ],
                    weightLogs(wlDetails),
                    storeCustomer(storeCustomerDetails),
                    order as orderMaster.[delivery(delivery), pickup(pickup), payments(payments)],
                    store(storeDetails).[settings],hub(storeDetails),
                    activityLog,
                ]`,
                {
                    reverse: (query) => {
                        query.orderBy('id', 'desc');
                    },
                    inventoryItemDetails: (query) => {
                        query.select('id');
                    },
                    inventoryDetails: (query) => {
                        query.select('id', 'productName');
                    },
                    wlDetails: (query) => {
                        query.select('id', 'totalWeight', 'status').where('step', 1);
                    },
                    referenceItemDetails: (query) => {
                        query.select('id', 'quantity');
                    },
                    orderItemDetails: (query) => {
                        query.select('id', 'status');
                    },
                    servPriceDetails: (query) => {
                        query.select('id');
                    },
                    serviceDetails: (query) => {
                        query.select('id', 'name');
                    },
                    categoryDetails: (query) => {
                        query.select('id', 'category');
                    },
                    storeCustomerDetails: (query) => {
                        query.select('firstName', 'lastName');
                    },
                    storeDetails: (query) => {
                        query.select('name', 'address', 'businessId', 'id');
                    },
                    payments: (query) => {
                        query
                            .select(
                                'paymentProcessor',
                                'paymentMemo',
                                'status',
                                'esdReceiptNumber',
                                'createdAt',
                                'updatedAt',
                                'transactionFee',
                            )
                            .where({ status: 'succeeded' })
                            .orderBy('updatedAt', 'desc');
                    },
                    delivery: (query) => {
                        query.select('totalDeliveryCost', 'type', 'id', 'storeId', 'orderId');
                    },
                    pickup: (query) => {
                        query.select('totalDeliveryCost', 'type', 'id', 'storeId', 'orderId');
                    },
                },
            )
            .orderByRaw('"orderMaster:payments"."createdAt" desc, "serviceOrders".id asc');
        orders = orders.where('store.businessId', business.id);
        let inventoryOrders = InventoryOrder.query()
            .withGraphJoined(
                `[order.[payments(payments), promotionDetails], lineItems,
        customer(customerDetails).[centsCustomer(customerDetails)], store(storeDetails).[settings],
        employee.[user(userDetails)]]`,
            )
            .modifiers({
                storeDetails: (query) => {
                    query.select('id', 'name', 'address', 'city', 'state', 'businessId');
                },
                userDetails: (query) => {
                    query.select('id', 'firstname', 'lastname', 'phone', 'email');
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
                            'createdAt',
                            'updatedAt',
                            'transactionFee',
                        )
                        .where({ status: 'succeeded' })
                        .orderBy('updatedAt', 'desc');
                },
                customerDetails: (query) => {
                    query.select(
                        'id',
                        'firstName',
                        'lastName',
                        'phoneNumber',
                        'email',
                        'languageId',
                    );
                },
            })
            .where({ 'inventoryOrders.paymentStatus': 'PAID' })
            .whereRaw(`"store"."businessId" =  ${business.id}`)
            .orderByRaw('"order:payments"."createdAt" desc, "inventoryOrders".id asc');
        if (queryParams.stores && !allStoresChecked) {
            orders = orders.whereIn('store.id', queryParams.stores);
            inventoryOrders = inventoryOrders.whereIn('store.id', queryParams.stores);
        } else if (allStoresChecked) {
            orders = orders.whereIn('store.id', allStoreIds);
            inventoryOrders = inventoryOrders.whereIn('store.id', allStoreIds);
        }

        if (queryParams.status === 'COMPLETED') {
            orders = orders.where(`${ServiceOrder.tableName}.status`, 'COMPLETED');
            inventoryOrders = inventoryOrders.where('inventoryOrders.status', 'COMPLETED');
        } else if (queryParams.status === 'ACTIVE') {
            orders = orders.where((builder) =>
                builder
                    .where(`${ServiceOrder.tableName}.status`, '<>', 'COMPLETED')
                    .andWhere(`${ServiceOrder.tableName}.status`, '<>', 'CANCELLED'),
            );
            inventoryOrders = inventoryOrders.whereNotIn('inventoryOrders.status', [
                'COMPLETED',
                'CANCELLED',
            ]);
        } else if (queryParams.status === 'COMPLETED_AND_ACTIVE') {
            orders = orders.where((builder) =>
                builder
                    .where(`${ServiceOrder.tableName}.status`, 'COMPLETED')
                    .orWhere(`${ServiceOrder.tableName}.status`, '<>', 'CANCELLED'),
            );
            inventoryOrders = inventoryOrders.where('inventoryOrders.status', '<>', 'CANCELLED');
        } else {
            orders = orders.andWhere(`${ServiceOrder.tableName}.status`, '<>', 'COMPLETED');
            inventoryOrders = inventoryOrders.where('inventoryOrders.status', '<>', 'COMPLETED');
        }
        if (startDate && endDate) {
            const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
                startDate,
                endDate,
                tz,
            );
            orders = orders.whereRaw(
                `CAST("orderMaster:payments"."createdAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            );
            inventoryOrders = inventoryOrders.whereRaw(
                `CAST("order:payments"."createdAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            );
        }
        orders = orders.andWhere(`${ServiceOrder.tableName}.paymentStatus`, '=', 'PAID');
        orders = await orders;
        const data = [
            [
                'Order ID',
                'Order Location',
                'Order Payment Date',
                'Order Payment Time',
                'Customer Name',
                'Order Value',
                'Per Pound Service',
                'Fixed Price Services',
                'Products',
                'Intake Employee',
                'Employee Completed Processing',
                'Intake Pounds',
                'Payment Type',
                'Payment Memo',
                'Cash Card Receipt',
                'Payment Status',
                'Order Status',
                'Credits',
                'Tip Amount',
                'Pickup Fee',
                'Delivery Fee',
                'Transaction Fee',
                'Recurring Discount',
            ],
        ];
        const empCodes = {};
        orders.forEach((a) => {
            if (a.employeeCode) {
                empCodes[a.employeeCode] = a.employeeCode;
            }
        });
        const teamMembers = await TeamMember.query()
            .select('teamMembers.id as employeeCode')
            .eagerAlgorithm(ServiceOrder.JoinEagerAlgorithm)
            .eager('[user(userDetails)]', {
                userDetails: (query) => {
                    query.select('firstname', 'lastname');
                },
            })
            .whereIn('teamMembers.id', Object.keys(empCodes));
        const teamMembersObj = {};
        teamMembers.forEach((a) => {
            teamMembersObj[a.employeeCode] = `${a.user.firstname} ${a.user.lastname}`;
        });
        orders.forEach((a) => {
            const location = a.store ? a.store.address : a.hub.address;
            const payment = a.orderMaster.payments;
            let perPoundServices;
            let fixedPriceServices;
            let products;
            let inTakePounds = a.weightLogs.length ? a.weightLogs[0].totalWeight : 0;
            let paymentType;
            let paymentMemo;
            let pickupFee = 0;
            let deliveryFee = 0;
            let esdReceiptNumber;
            let transactionFee;
            const { paymentStatus } = a;
            const inTakeDate = momenttz(payment[0].updatedAt)
                .tz(a.store.settings.timeZone)
                .format('MM-DD-YYYY');
            const inTakeTime = momenttz(payment[0].updatedAt)
                .tz(a.store.settings.timeZone)
                .format('hh:mm A');
            (a.orderItems || []).forEach((orderItem) => {
                if (orderItem.refItem) {
                    (orderItem.refItem || []).forEach((refItem) => {
                        let service;
                        let inventory;
                        if (refItem.weightLog) {
                            (refItem.weightLog || []).forEach((weightLog) => {
                                inTakePounds += weightLog.totalWeight;
                            });
                        }
                        if (refItem.inventoryItem && refItem.inventoryItem.inventory) {
                            inventory = refItem.inventoryItem.inventory;
                        }
                        if (inventory) {
                            products = products || [];
                            products.push(inventory.productName);
                        }
                        if (refItem.servPrice) {
                            service = refItem.servPrice.service;
                        }
                        if (refItem.serv) {
                            service = refItem.serv;
                        }
                        if (
                            service &&
                            service.categories &&
                            service.categories.category === 'FIXED_PRICE'
                        ) {
                            fixedPriceServices = fixedPriceServices || [];
                            fixedPriceServices.push(service.name);
                        } else if (
                            service &&
                            service.categories &&
                            service.categories.category === 'PER_POUND'
                        ) {
                            perPoundServices = perPoundServices || [];
                            perPoundServices.push(service.name);
                        }
                    });
                }
            });
            fixedPriceServices = fixedPriceServices
                ? [...new Set(fixedPriceServices)].join()
                : null;
            products = products ? [...new Set(products)].join() : null;
            perPoundServices = perPoundServices ? [...new Set(perPoundServices)].join() : null;
            const inTakeEmp = teamMembersObj[a.employeeCode];
            const processingActivityLog = a.activityLog.filter(
                (item) => item.status === 'READY_FOR_PICKUP',
            );
            const processingEmployee =
                processingActivityLog.length > 0 ? processingActivityLog[0].employeeName : null;
            if (a.orderMaster.payments && a.orderMaster.payments.length > 0) {
                paymentType = a.orderMaster.payments.map((payment) =>
                    payment.paymentProcessor === 'stripe' ? 'Cents' : payment.paymentProcessor,
                );
                paymentType = paymentType ? [...new Set(paymentType)].join() : null;

                paymentMemo = a.orderMaster.payments.map((payment) => payment.paymentMemo).join();

                esdReceiptNumber = a.orderMaster.payments.filter(
                    (item) => item.esdReceiptNumber != null,
                );

                const transactionFees = a.orderMaster.payments.map(
                    (payment) => payment.transactionFee,
                );
                transactionFee = transactionFees.reduce(
                    (previous, currentItem) => previous + currentItem,
                    0,
                );
            }
            if (a.orderMaster.delivery) {
                deliveryFee = a.orderMaster.delivery.totalDeliveryCost;
            }
            if (a.orderMaster.pickup) {
                pickupFee = a.orderMaster.pickup.totalDeliveryCost;
            }
            let custName;
            if (a.storeCustomer) {
                custName = `${a.storeCustomer.firstName} ${a.storeCustomer.lastName}`;
            }
            const recurringDiscountAmount = Number((a.recurringDiscountInCents / 100).toFixed(2));
            data.push([
                getOrderCodePrefix(a),
                location,
                inTakeDate,
                inTakeTime,
                custName,
                a.netOrderTotal,
                perPoundServices,
                fixedPriceServices,
                products,
                inTakeEmp,
                processingEmployee,
                inTakePounds,
                paymentType,
                paymentMemo,
                esdReceiptNumber[0],
                paymentStatus,
                a.status,
                a.creditAmount,
                a.tipAmount,
                pickupFee,
                deliveryFee,
                transactionFee,
                recurringDiscountAmount,
            ]);
        });
        inventoryOrders = await inventoryOrders;
        inventoryOrders.forEach((inventoryOrder) => {
            data.push(
                mapInventoryOrderDetails(inventoryOrder, inventoryOrder.store.settings.timeZone),
            );
        });
        return res.status(200).send(data);
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { getOrdersReport };
