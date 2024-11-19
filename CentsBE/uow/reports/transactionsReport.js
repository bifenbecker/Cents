const momenttz = require('moment-timezone');
const AbstractCsvReport = require('./abstractCsvReport');
const reportUtils = require('../../utils/reports/reportsUtils');
const ServiceOrder = require('../../models/serviceOrders');
const InventoryOrder = require('../../models/inventoryOrders');
const TeamMember = require('../../models/teamMember');

class TransactionsReport extends AbstractCsvReport {
    getRequiredParams() {
        return [
            'startDate',
            'endDate',
            'timeZone',
            'stores',
            'status',
            'allStoresCheck',
            'businessId',
            'allStoreIds',
        ];
    }

    getReportObjectType() {
        return 'object';
    }

    getReportName() {
        return 'Cents_Transactions_Report';
    }

    getReportHeaders() {
        return [
            {
                title: 'Payment Date',
                id: 'paymentDate',
            },
            {
                title: 'Payment Time',
                id: 'paymentTime',
            },
            {
                title: 'Order Location',
                id: 'orderLocation',
            },
            {
                title: 'Order ID',
                id: 'orderId',
            },
            {
                title: 'Customer Name',
                id: 'customerName',
            },
            {
                title: 'Customer Paid',
                id: 'customerPaid',
            },
            {
                title: 'Transaction Fee',
                id: 'transactionFee',
            },
            {
                title: 'Funds Received',
                id: 'fundsReceived',
            },
            {
                title: 'Payment Method',
                id: 'paymentMethod',
            },
            {
                title: 'Payment Employee',
                id: 'paymentEmployee',
            },
        ];
    }

    mapReportDataToRows(reportData) {
        return reportData;
    }

    async getReportData() {
        const {
            startDate,
            endDate,
            timeZone,
            stores,
            status,
            allStoresCheck,
            businessId,
            allStoreIds,
        } = this;

        let orders = ServiceOrder.query()
            .withGraphJoined(
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
            )
            .modifiers({
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
                            'status',
                            'esdReceiptNumber',
                            'createdAt',
                            'updatedAt',
                            'transactionFee',
                            'totalAmount',
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
            })
            .orderByRaw('"orderMaster:payments"."createdAt" desc, "serviceOrders".id asc');
        orders = orders.where('store.businessId', businessId);
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
            .whereRaw(`"store"."businessId" =  ${businessId}`)
            .orderByRaw('"order:payments"."createdAt" desc, "inventoryOrders".id asc');
        if (stores && !allStoresCheck) {
            orders = orders.whereIn('store.id', stores);
            inventoryOrders = inventoryOrders.whereIn('store.id', stores);
        } else if (allStoresCheck) {
            orders = orders.whereIn('store.id', allStoreIds);
            inventoryOrders = inventoryOrders.whereIn('store.id', allStoreIds);
        }

        if (status === 'COMPLETED') {
            orders = orders.where(`${ServiceOrder.tableName}.status`, 'COMPLETED');
            inventoryOrders = inventoryOrders.where('inventoryOrders.status', 'COMPLETED');
        } else if (status === 'ACTIVE') {
            orders = orders.where((builder) =>
                builder
                    .where(`${ServiceOrder.tableName}.status`, '<>', 'COMPLETED')
                    .andWhere(`${ServiceOrder.tableName}.status`, '<>', 'CANCELLED'),
            );
            inventoryOrders = inventoryOrders.whereNotIn('inventoryOrders.status', [
                'COMPLETED',
                'CANCELLED',
            ]);
        } else if (status === 'COMPLETED_AND_ACTIVE') {
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

        const [finalStartDate, finalEndDate] = reportUtils.getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );
        orders = orders.whereRaw(
            `CAST("orderMaster:payments"."createdAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
        );
        inventoryOrders = inventoryOrders.whereRaw(
            `CAST("order:payments"."createdAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
        );

        orders = orders.andWhere(`${ServiceOrder.tableName}.paymentStatus`, '=', 'PAID');
        orders = await orders;
        const reportData = [];
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
            const timeZone = a.store.settings.timeZone || 'UTC';
            const { payments } = a.orderMaster;
            let paymentMethod;
            let transactionFee;
            let fundsReceived;
            let inTakeDate;
            let inTakeTime;
            const paymentEmployee = teamMembersObj[a.employeeCode];
            if (payments && payments.length > 0) {
                inTakeDate = momenttz(payments[0].updatedAt).tz(timeZone).format('MM-DD-YYYY');
                inTakeTime = momenttz(payments[0].updatedAt).tz(timeZone).format('hh:mm A');
                paymentMethod = payments.map((payment) =>
                    payment.paymentProcessor === 'stripe' ? 'Cents' : payment.paymentProcessor,
                );
                paymentMethod = paymentMethod ? [...new Set(paymentMethod)].join() : null;
                fundsReceived = payments.map(
                    (payment) => payment.totalAmount - payment.transactionFee,
                );
                fundsReceived = fundsReceived.reduce(
                    (previousPayment, currentPayment) => previousPayment + currentPayment,
                );

                const transactionFees = payments.map((payment) => payment.transactionFee);
                transactionFee = transactionFees.reduce(
                    (previous, currentItem) => previous + currentItem,
                    0,
                );
            }
            let customerName;
            if (a.storeCustomer) {
                customerName = `${a.storeCustomer.firstName} ${a.storeCustomer.lastName}`;
            }
            reportData.push({
                paymentDate: inTakeDate,
                paymentTime: inTakeTime,
                orderLocation: location,
                orderId: a.orderCode,
                customerName,
                customerPaid: a.netOrderTotal,
                transactionFee,
                fundsReceived,
                paymentMethod,
                paymentEmployee,
            });
        });
        inventoryOrders = await inventoryOrders;
        const isTransactionsReport = true;
        inventoryOrders.forEach((inventoryOrder) => {
            reportData.push(
                reportUtils.mapInventoryOrderDetails(
                    inventoryOrder,
                    inventoryOrder.store.timeZone || 'UTC',
                    isTransactionsReport,
                ),
            );
        });

        return reportData;
    }
}

module.exports = exports = TransactionsReport;
