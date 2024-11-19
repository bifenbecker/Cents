require('../../../testHelper');
const LaborReport = require('../../../../uow/reports/laborReport');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const moment = require('moment');
const {
    statuses,
    inventoryOrderStatuses,
    paymentTimings,
} = require('../../../../constants/constants');
const InventoryOrder = require('../../../../models/inventoryOrders');
const StoreSettings = require('../../../../models/storeSettings');
const { createCompletedInventoryOrder } = require('../../../support/inventoryOrderTestHelper');
const { createCompletedServiceOrder } = require('../../../support/serviceOrderTestHelper');
const momenttz = require('moment-timezone');

function getOrderFormattedDate(date, timeZone) {
    return momenttz(date).tz(timeZone).format('MM-DD-YYYY');
}

function getOrderFormattedTime(date, timeZone) {
    return momenttz(date).tz(timeZone).format('hh:mm A');
}

const parseStringToDate = (date, timeZone) => {
    return momenttz(date).tz(timeZone).toDate();
};

describe('test laborReport', () => {
    let laborReport;

    beforeEach(async () => {
        laborReport = new LaborReport();
    });

    it('getRequiredParams should return required params', () => {
        expect(laborReport.getRequiredParams()).to.have.members([
            'startDate',
            'endDate',
            'timeZone',
            'stores',
        ]);
    });

    it('getReportObjectType should return object type', () => {
        expect(laborReport.getReportObjectType()).to.equal('object');
    });

    it('getReportName should return report name', () => {
        expect(laborReport.getReportName()).to.equal('Cents_Labor_Report');
    });

    it('getReportHeaders should return report headers', () => {
        expect(laborReport.getReportHeaders()).to.have.deep.members([
            {
                title: 'Order Type',
                id: 'orderPrefix',
            },
            {
                title: 'Order Id',
                id: 'orderCode',
            },
            {
                title: 'Order Completed Date',
                id: 'completedAtDate',
            },
            {
                title: 'Order Total',
                id: 'orderTotal',
            },
            {
                title: 'Tip Total',
                id: 'tipTotal',
            },
            {
                title: 'Pounds At Intake',
                id: 'inTakePounds',
            },
            {
                title: 'Intake Employee',
                id: 'intakeEmployee',
            },
            {
                title: 'Intake Time',
                id: 'intakeTime',
            },
            {
                title: 'Pounds Before Processing',
                id: 'beforeProcessingPounds',
            },
            {
                title: 'Washing Employee',
                id: 'washingEmployee',
            },
            {
                title: 'Washing Time',
                id: 'washingTime',
            },
            {
                title: 'Drying Employee',
                id: 'dryingEmployee',
            },
            {
                title: 'Drying Time',
                id: 'dryingTime',
            },
            {
                title: 'Pounds After Processing',
                id: 'afterProcessingPounds',
            },
            {
                title: 'Pounds At Completion',
                id: 'completionPounds',
            },
            {
                title: 'Complete Processing Employee',
                id: 'completeProcessingEmployee',
            },
            {
                title: 'Completion Time',
                id: 'completedAtTime',
            },
            {
                title: 'Total Processing Time(Hours)',
                id: 'totalProcessingTime',
            },
            {
                title: 'Payment Employee',
                id: 'paymentEmployee',
            },
            {
                title: 'Payment Method',
                id: 'paymentMethod',
            },
            {
                title: 'Total Turnaround Time(Hours)',
                id: 'totalTurnaroundTime',
            },
            {
                title: 'Complete / Pickup Employee',
                id: 'completedEmployee',
            },
        ]);
    });

    it('mapReportDataToRows should return mapped data', () => {
        const data = [
            {
                orderType: 'SERVICE',
                totalTurnaroundTimeStart: '2022-09-12T12:44:41.197Z',
                completedAt: '2022-09-13T03:14:41.197Z',
                totalProcessingTimeStart: '2022-09-11T12:44:41.197Z',
                totalProcessingTimeEnd: '2022-09-13T13:14:41.197Z',
            },
            {
                orderType: 'INVENTORY',
            },
            {
                orderType: 'RESIDENTIAL',
            },
            {
                orderType: 'ONLINE',
            },
            {
                orderType: 'invalid_type',
            },
        ];

        expect(laborReport.mapReportDataToRows(data)).to.deep.equal([
            {
                orderPrefix: 'WF',
                totalProcessingTime: 48.5,
                totalTurnaroundTime: 14.5,
            },
            {
                orderPrefix: 'INV',
                totalProcessingTime: null,
                totalTurnaroundTime: null,
            },
            {
                orderPrefix: 'RWF',
                totalProcessingTime: null,
                totalTurnaroundTime: null,
            },
            {
                orderPrefix: 'DWF',
                totalProcessingTime: null,
                totalTurnaroundTime: null,
            },
            {
                orderPrefix: 'WF',
                totalProcessingTime: null,
                totalTurnaroundTime: null,
            },
        ]);
    });

    describe('getReportData', () => {
        const timeZone = 'America/New_York';

        let stores,
            // SO 1_1
            store1_serviceOrder1,
            store1_serviceOrder1_intakeWeight,
            store1_serviceOrder1_beforeProcessingWeight,
            store1_serviceOrder1_afterProcessingWeight,
            store1_serviceOrder1_completionWeight,
            store1_serviceOrder1_activityLogs,
            store1_serviceOrder1_washingTurnUser,
            store1_serviceOrder1_dryingTurnUser,
            store1_serviceOrder1_payment,
            // IO 1_1
            store1_inventoryOrder1,
            store1_inventoryOrder1_employee,
            // SO 1_2
            store1_serviceOrder2,
            store1_serviceOrder2_intakeWeight,
            store1_serviceOrder2_beforeProcessingWeight,
            store1_serviceOrder2_afterProcessingWeight,
            store1_serviceOrder2_completionWeight,
            store1_serviceOrder2_activityLogs,
            store1_serviceOrder2_washingTurnUser,
            store1_serviceOrder2_dryingTurnUser,
            // SO 2_1
            store2_serviceOrder1,
            store2_serviceOrder1_intakeWeight,
            store2_serviceOrder1_beforeProcessingWeight,
            store2_serviceOrder1_afterProcessingWeight,
            store2_serviceOrder1_completionWeight,
            store2_serviceOrder1_activityLogs,
            // IO 2_1
            store2_inventoryOrder1,
            store2_inventoryOrder1_employee;

        beforeEach(async () => {
            laborReport = new LaborReport();
            stores = await factory.createMany(FACTORIES_NAMES.store, 2);
            // Set timezones
            await StoreSettings.query()
                .whereIn(
                    'id',
                    stores.map((store) => store.id),
                )
                .patch({
                    timeZone,
                });

            // Create orders
            // Store 1
            ({
                serviceOrder: store1_serviceOrder1,
                totalIntakeWeight: store1_serviceOrder1_intakeWeight,
                totalBeforeProcessingWeight: store1_serviceOrder1_beforeProcessingWeight,
                totalAfterProcessingWeight: store1_serviceOrder1_afterProcessingWeight,
                totalCompletionWeight: store1_serviceOrder1_completionWeight,
                activityLogs: store1_serviceOrder1_activityLogs,
                washingTurnUser: store1_serviceOrder1_washingTurnUser,
                dryingTurnUser: store1_serviceOrder1_dryingTurnUser,
                payment: store1_serviceOrder1_payment,
            } = await createCompletedServiceOrder(stores[0], {
                serviceOrderFields: {
                    placedAt: new Date(),
                    completedAt: moment().add(5, 'm').toDate(),
                    netOrderTotal: 12.5,
                    tipAmount: 5,
                    paymentTiming: paymentTimings['PRE-PAY'],
                    orderCode: '123',
                },
                intakeWeights: [10],
                beforeProcessingWeights: [10],
                afterProcessingWeights: [9.5],
                completionWeights: [9.5],
                withActivityLogs: true,
                withWashingTurns: true,
                withDryingTurns: true,
                withPayment: true,
            }));
            ({
                inventoryOrder: store1_inventoryOrder1,
                employeeUser: store1_inventoryOrder1_employee,
            } = await createCompletedInventoryOrder({
                storeId: stores[0].id,
                netOrderTotal: 5.99,
                updatedAt: moment().add(4, 'm').toDate(),
                tipAmount: 3,
                withEmployee: true,
            }));
            ({
                serviceOrder: store1_serviceOrder2,
                totalIntakeWeight: store1_serviceOrder2_intakeWeight,
                totalBeforeProcessingWeight: store1_serviceOrder2_beforeProcessingWeight,
                totalAfterProcessingWeight: store1_serviceOrder2_afterProcessingWeight,
                totalCompletionWeight: store1_serviceOrder2_completionWeight,
                activityLogs: store1_serviceOrder2_activityLogs,
                washingTurnUser: store1_serviceOrder2_washingTurnUser,
                dryingTurnUser: store1_serviceOrder2_dryingTurnUser,
            } = await createCompletedServiceOrder(stores[0], {
                serviceOrderFields: {
                    placedAt: new Date(),
                    completedAt: moment().add(3, 'm').toDate(),
                    netOrderTotal: 12.5,
                    tipAmount: null,
                    paymentTiming: paymentTimings['POST-PAY'],
                    orderCode: '124',
                },
                intakeWeights: null,
                beforeProcessingWeights: null,
                afterProcessingWeights: null,
                completionWeights: null,
                withActivityLogs: false,
                withWashingTurns: true,
                withDryingTurns: true,
            }));

            // Store 2
            ({
                serviceOrder: store2_serviceOrder1,
                totalIntakeWeight: store2_serviceOrder1_intakeWeight,
                totalBeforeProcessingWeight: store2_serviceOrder1_beforeProcessingWeight,
                totalAfterProcessingWeight: store2_serviceOrder1_afterProcessingWeight,
                totalCompletionWeight: store2_serviceOrder1_completionWeight,
                activityLogs: store2_serviceOrder1_activityLogs,
            } = await createCompletedServiceOrder(stores[1], {
                serviceOrderFields: {
                    placedAt: new Date(),
                    completedAt: moment().add(2, 'm').toDate(),
                    netOrderTotal: 75,
                    tipAmount: 0,
                    paymentTiming: paymentTimings['PRE-PAY'],
                    orderCode: '125',
                },
                intakeWeights: [12, 14, 3],
                beforeProcessingWeights: [12, 14, 3],
                afterProcessingWeights: [11.8, 14, 2],
                completionWeights: [11.8, 13.8, 2],
                withActivityLogs: true,
            }));
            ({
                inventoryOrder: store2_inventoryOrder1,
                employeeUser: store2_inventoryOrder1_employee,
            } = await createCompletedInventoryOrder({
                storeId: stores[1].id,
                netOrderTotal: 4.99,
                updatedAt: moment().add(1, 'm').toDate(),
                tipAmount: 1.5,
                withEmployee: false,
            }));
        });

        it('should return report data for a single store', async () => {
            const options = {
                startDate: moment().subtract(1, 'w').format(),
                endDate: moment().add(1, 'w').format(),
                timeZone: 'America/Los_Angeles',
                stores: [stores[0].id],
            };
            laborReport.initialize(options);

            expect(await laborReport.getReportData()).to.deep.equal([
                {
                    orderType: 'SERVICE',
                    orderCode: store1_serviceOrder1.orderCode,
                    completedAt: store1_serviceOrder1.completedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_serviceOrder1.completedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_serviceOrder1.completedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_serviceOrder1.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_serviceOrder1.tipAmount ?? 0).toFixed(2)}`,
                    inTakePounds: store1_serviceOrder1_intakeWeight,
                    beforeProcessingPounds: store1_serviceOrder1_beforeProcessingWeight,
                    intakeEmployee: store1_serviceOrder1_activityLogs?.intake?.employeeName ?? null,
                    completeProcessingEmployee:
                        store1_serviceOrder1_activityLogs?.completeProcessing?.employeeName ?? null,
                    afterProcessingPounds: store1_serviceOrder1_afterProcessingWeight,
                    completionPounds: store1_serviceOrder1_completionWeight,
                    completedEmployee:
                        store1_serviceOrder1_activityLogs?.completeOrPickup?.employeeName ?? null,
                    paymentEmployee:
                        store1_serviceOrder1_activityLogs?.intake?.employeeName ?? null, // pre-paid
                    washingEmployee: store1_serviceOrder1_washingTurnUser.fullName,
                    dryingEmployee: store1_serviceOrder1_dryingTurnUser.fullName,
                    dryingTime: getOrderFormattedTime(
                        store1_serviceOrder1_dryingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    intakeTime: getOrderFormattedTime(
                        store1_serviceOrder1_activityLogs?.intake?.updatedAt,
                        timeZone,
                    ),
                    washingTime: getOrderFormattedTime(
                        store1_serviceOrder1_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    paymentMethod: store1_serviceOrder1_payment?.paymentProcessor,
                    totalProcessingTimeStart: parseStringToDate(
                        store1_serviceOrder1_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    totalProcessingTimeEnd: parseStringToDate(
                        store1_serviceOrder1_activityLogs?.completeProcessing?.updatedAt,
                        timeZone,
                    ),
                    totalTurnaroundTimeStart: parseStringToDate(
                        store1_serviceOrder1_activityLogs?.intake?.updatedAt,
                        timeZone,
                    ),
                },
                {
                    orderType: 'INVENTORY',
                    orderCode: store1_inventoryOrder1.orderCode,
                    completedAt: store1_inventoryOrder1.updatedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_inventoryOrder1.updatedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_inventoryOrder1.updatedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_inventoryOrder1.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_inventoryOrder1.tipAmount ?? 0).toFixed(2)}`,
                    inTakePounds: null,
                    beforeProcessingPounds: null,
                    intakeEmployee: store1_inventoryOrder1_employee?.fullName ?? null,
                    completeProcessingEmployee: null,
                    afterProcessingPounds: null,
                    completionPounds: null,
                    completedEmployee: null,
                    paymentEmployee: store1_inventoryOrder1_employee?.fullName ?? null,
                    washingEmployee: null,
                    dryingEmployee: null,
                    dryingTime: null,
                    intakeTime: null,
                    washingTime: null,
                    paymentMethod: null,
                    totalProcessingTimeStart: null,
                    totalProcessingTimeEnd: null,
                    totalTurnaroundTimeStart: null,
                },
                {
                    orderType: 'SERVICE',
                    orderCode: store1_serviceOrder2.orderCode,
                    completedAt: store1_serviceOrder2.completedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_serviceOrder2.completedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_serviceOrder2.completedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_serviceOrder2.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_serviceOrder2.tipAmount ?? 0).toFixed(2)}`,
                    inTakePounds: store1_serviceOrder2_intakeWeight,
                    beforeProcessingPounds: store1_serviceOrder2_beforeProcessingWeight,
                    intakeEmployee: store1_serviceOrder2_activityLogs?.intake?.employeeName ?? null,
                    completeProcessingEmployee:
                        store1_serviceOrder2_activityLogs?.completeProcessing?.employeeName ?? null,
                    afterProcessingPounds: store1_serviceOrder2_afterProcessingWeight,
                    completionPounds: store1_serviceOrder2_completionWeight,
                    completedEmployee:
                        store1_serviceOrder2_activityLogs?.completeOrPickup?.employeeName ?? null,
                    paymentEmployee:
                        store1_serviceOrder2_activityLogs?.completeOrPickup?.employeeName ?? null,
                    washingEmployee: store1_serviceOrder2_washingTurnUser.fullName,
                    dryingEmployee: store1_serviceOrder2_dryingTurnUser.fullName,
                    dryingTime: getOrderFormattedTime(
                        store1_serviceOrder2_dryingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    intakeTime: null,
                    washingTime: getOrderFormattedTime(
                        store1_serviceOrder2_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    paymentMethod: null,
                    totalProcessingTimeEnd: null,
                    totalTurnaroundTimeStart: null,
                    totalProcessingTimeStart: parseStringToDate(
                        store1_serviceOrder2_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                },
            ]);
        });

        it('should not return orders outside date range', async () => {
            const options = {
                startDate: moment().add(1, 'w').format(),
                endDate: moment().add(2, 'w').format(),
                timeZone: 'America/Los_Angeles',
                stores: [stores[0].id],
            };
            laborReport.initialize(options);

            expect(await laborReport.getReportData())
                .to.be.an('array')
                .that.have.lengthOf(0);
        });

        it('should return report data for multiple stores', async () => {
            const options = {
                startDate: moment().subtract(1, 'w').format(),
                endDate: moment().add(1, 'w').format(),
                timeZone: 'America/Los_Angeles',
                stores: [stores[0].id, stores[1].id],
            };
            laborReport.initialize(options);

            expect(await laborReport.getReportData()).to.deep.equal([
                {
                    orderType: 'SERVICE',
                    orderCode: store1_serviceOrder1.orderCode,
                    completedAt: store1_serviceOrder1.completedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_serviceOrder1.completedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_serviceOrder1.completedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_serviceOrder1.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_serviceOrder1.tipAmount ?? 0).toFixed(2)}`,
                    inTakePounds: store1_serviceOrder1_intakeWeight,
                    beforeProcessingPounds: store1_serviceOrder1_beforeProcessingWeight,
                    intakeEmployee: store1_serviceOrder1_activityLogs?.intake?.employeeName ?? null,
                    completeProcessingEmployee:
                        store1_serviceOrder1_activityLogs?.completeProcessing?.employeeName ?? null,
                    afterProcessingPounds: store1_serviceOrder1_afterProcessingWeight,
                    completionPounds: store1_serviceOrder1_completionWeight,
                    completedEmployee:
                        store1_serviceOrder1_activityLogs?.completeOrPickup?.employeeName ?? null,
                    paymentEmployee:
                        store1_serviceOrder1_activityLogs?.intake?.employeeName ?? null, // pre-paid
                    washingEmployee: store1_serviceOrder1_washingTurnUser.fullName,
                    dryingEmployee: store1_serviceOrder1_dryingTurnUser.fullName,
                    dryingTime: getOrderFormattedTime(
                        store1_serviceOrder1_dryingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    intakeTime: getOrderFormattedTime(
                        store1_serviceOrder1_activityLogs?.intake?.updatedAt,
                        timeZone,
                    ),
                    washingTime: getOrderFormattedTime(
                        store1_serviceOrder1_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    paymentMethod: store1_serviceOrder1_payment?.paymentProcessor,
                    totalProcessingTimeStart: parseStringToDate(
                        store1_serviceOrder1_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    totalProcessingTimeEnd: parseStringToDate(
                        store1_serviceOrder1_activityLogs?.completeProcessing?.updatedAt,
                        timeZone,
                    ),
                    totalTurnaroundTimeStart: parseStringToDate(
                        store1_serviceOrder1_activityLogs?.intake?.updatedAt,
                        timeZone,
                    ),
                },
                {
                    orderType: 'INVENTORY',
                    orderCode: store1_inventoryOrder1.orderCode,
                    completedAt: store1_inventoryOrder1.updatedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_inventoryOrder1.updatedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_inventoryOrder1.updatedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_inventoryOrder1.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_inventoryOrder1.tipAmount ?? 0).toFixed(2)}`,
                    inTakePounds: null,
                    beforeProcessingPounds: null,
                    intakeEmployee: store1_inventoryOrder1_employee?.fullName ?? null,
                    completeProcessingEmployee: null,
                    afterProcessingPounds: null,
                    completionPounds: null,
                    completedEmployee: null,
                    paymentEmployee: store1_inventoryOrder1_employee?.fullName ?? null,
                    washingEmployee: null,
                    dryingEmployee: null,
                    dryingTime: null,
                    intakeTime: null,
                    washingTime: null,
                    paymentMethod: null,
                    totalProcessingTimeStart: null,
                    totalProcessingTimeEnd: null,
                    totalTurnaroundTimeStart: null,
                },
                {
                    orderType: 'SERVICE',
                    orderCode: store1_serviceOrder2.orderCode,
                    completedAt: store1_serviceOrder2.completedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_serviceOrder2.completedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_serviceOrder2.completedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_serviceOrder2.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_serviceOrder2.tipAmount ?? 0).toFixed(2)}`,
                    inTakePounds: store1_serviceOrder2_intakeWeight,
                    beforeProcessingPounds: store1_serviceOrder2_beforeProcessingWeight,
                    intakeEmployee: store1_serviceOrder2_activityLogs?.intake?.employeeName ?? null,
                    completeProcessingEmployee:
                        store1_serviceOrder2_activityLogs?.completeProcessing?.employeeName ?? null,
                    afterProcessingPounds: store1_serviceOrder2_afterProcessingWeight,
                    completionPounds: store1_serviceOrder2_completionWeight,
                    completedEmployee:
                        store1_serviceOrder2_activityLogs?.completeOrPickup?.employeeName ?? null,
                    paymentEmployee:
                        store1_serviceOrder2_activityLogs?.completeOrPickup?.employeeName ?? null,
                    washingEmployee: store1_serviceOrder2_washingTurnUser.fullName,
                    dryingEmployee: store1_serviceOrder2_dryingTurnUser.fullName,
                    dryingTime: getOrderFormattedTime(
                        store1_serviceOrder2_dryingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    intakeTime: null,
                    washingTime: getOrderFormattedTime(
                        store1_serviceOrder2_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    paymentMethod: null,
                    totalProcessingTimeEnd: null,
                    totalTurnaroundTimeStart: null,
                    totalProcessingTimeStart: parseStringToDate(
                        store1_serviceOrder2_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                },
                {
                    orderType: 'SERVICE',
                    orderCode: store2_serviceOrder1.orderCode,
                    completedAt: store2_serviceOrder1.completedAt,
                    completedAtDate: getOrderFormattedDate(
                        store2_serviceOrder1.completedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store2_serviceOrder1.completedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store2_serviceOrder1.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store2_serviceOrder1.tipAmount || 0).toFixed(2)}`,
                    inTakePounds: store2_serviceOrder1_intakeWeight,
                    beforeProcessingPounds: store2_serviceOrder1_beforeProcessingWeight,
                    intakeEmployee: store2_serviceOrder1_activityLogs?.intake?.employeeName ?? null,
                    completeProcessingEmployee:
                        store2_serviceOrder1_activityLogs?.completeProcessing?.employeeName ?? null,
                    afterProcessingPounds: store2_serviceOrder1_afterProcessingWeight,
                    completionPounds: store2_serviceOrder1_completionWeight,
                    completedEmployee:
                        store2_serviceOrder1_activityLogs?.completeOrPickup?.employeeName ?? null,
                    paymentEmployee:
                        store2_serviceOrder1_activityLogs?.intake?.employeeName ?? null, // pre-paid
                    washingEmployee:
                        store2_serviceOrder1_activityLogs?.washing?.employeeName ?? null,
                    dryingEmployee:
                        store2_serviceOrder1_activityLogs?.washing?.employeeName ?? null,
                    dryingTime: getOrderFormattedTime(
                        store2_serviceOrder1_activityLogs?.washing?.updatedAt,
                        timeZone,
                    ),
                    intakeTime: getOrderFormattedTime(
                        store2_serviceOrder1_activityLogs?.intake?.updatedAt,
                        timeZone,
                    ),
                    washingTime: getOrderFormattedTime(
                        store2_serviceOrder1_activityLogs?.washing?.updatedAt,
                        timeZone,
                    ),
                    paymentMethod: null,
                    totalProcessingTimeStart: parseStringToDate(
                        store2_serviceOrder1_activityLogs?.washing?.updatedAt,
                        timeZone,
                    ),
                    totalProcessingTimeEnd: parseStringToDate(
                        store2_serviceOrder1_activityLogs?.completeProcessing?.updatedAt,
                        timeZone,
                    ),
                    totalTurnaroundTimeStart: parseStringToDate(
                        store2_serviceOrder1_activityLogs?.intake?.updatedAt,
                        timeZone,
                    ),
                },
                {
                    orderType: 'INVENTORY',
                    orderCode: store2_inventoryOrder1.orderCode,
                    completedAt: store2_inventoryOrder1.updatedAt,
                    completedAtDate: getOrderFormattedDate(
                        store2_inventoryOrder1.updatedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store2_inventoryOrder1.updatedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store2_inventoryOrder1.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store2_inventoryOrder1.tipAmount || 0).toFixed(2)}`,
                    inTakePounds: null,
                    beforeProcessingPounds: null,
                    intakeEmployee: store2_inventoryOrder1_employee?.fullName ?? null,
                    completeProcessingEmployee: null,
                    afterProcessingPounds: null,
                    completionPounds: null,
                    completedEmployee: null,
                    paymentEmployee: store2_inventoryOrder1_employee?.fullName ?? null,
                    washingEmployee: null,
                    dryingEmployee: null,
                    dryingTime: null,
                    intakeTime: null,
                    washingTime: null,
                    paymentMethod: null,
                    totalProcessingTimeStart: null,
                    totalProcessingTimeEnd: null,
                    totalTurnaroundTimeStart: null,
                },
            ]);
        });

        it('should not return not completed orders', async () => {
            await factory.create(FACTORIES_NAMES.serviceOrder, {
                storeId: stores[0].id,
                placedAt: new Date(),
                completedAt: moment().add(1, 'm'),
                status: statuses.PROCESSING,
                netOrderTotal: 12.5,
                tipAmount: 5,
            });
            await factory.create(FACTORIES_NAMES.inventoryOrder, {
                storeId: stores[0].id,
                netOrderTotal: 4.99,
                createdAt: new Date(),
                updatedAt: moment().add(1, 'm'),
                status: inventoryOrderStatuses.CREATED,
                tipAmount: 3,
            });

            const options = {
                startDate: moment().subtract(1, 'w').format(),
                endDate: moment().add(1, 'w').format(),
                timeZone: 'America/Los_Angeles',
                stores: [stores[0].id],
            };
            laborReport.initialize(options);

            expect(await laborReport.getReportData()).to.deep.equal([
                {
                    orderType: 'SERVICE',
                    orderCode: store1_serviceOrder1.orderCode,
                    completedAt: store1_serviceOrder1.completedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_serviceOrder1.completedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_serviceOrder1.completedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_serviceOrder1.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_serviceOrder1.tipAmount || 0).toFixed(2)}`,
                    inTakePounds: store1_serviceOrder1_intakeWeight,
                    beforeProcessingPounds: store1_serviceOrder1_beforeProcessingWeight,
                    intakeEmployee: store1_serviceOrder1_activityLogs?.intake?.employeeName ?? null,
                    completeProcessingEmployee:
                        store1_serviceOrder1_activityLogs?.completeProcessing?.employeeName ?? null,
                    afterProcessingPounds: store1_serviceOrder1_afterProcessingWeight,
                    completionPounds: store1_serviceOrder1_completionWeight,
                    completedEmployee:
                        store1_serviceOrder1_activityLogs?.completeOrPickup?.employeeName ?? null,
                    paymentEmployee:
                        store1_serviceOrder1_activityLogs?.intake?.employeeName ?? null, // pre-paid
                    washingEmployee: store1_serviceOrder1_washingTurnUser.fullName,
                    dryingEmployee: store1_serviceOrder1_dryingTurnUser.fullName,
                    dryingTime: getOrderFormattedTime(
                        store1_serviceOrder1_dryingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    intakeTime: getOrderFormattedTime(
                        store1_serviceOrder1_activityLogs?.intake?.updatedAt,
                        timeZone,
                    ),
                    washingTime: getOrderFormattedTime(
                        store1_serviceOrder1_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    paymentMethod: store1_serviceOrder1_payment?.paymentProcessor,
                    totalProcessingTimeStart: parseStringToDate(
                        store1_serviceOrder1_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    totalProcessingTimeEnd: parseStringToDate(
                        store1_serviceOrder1_activityLogs?.completeProcessing?.updatedAt,
                        timeZone,
                    ),
                    totalTurnaroundTimeStart: parseStringToDate(
                        store1_serviceOrder1_activityLogs?.intake?.updatedAt,
                        timeZone,
                    ),
                },
                {
                    orderType: 'INVENTORY',
                    orderCode: store1_inventoryOrder1.orderCode,
                    completedAt: store1_inventoryOrder1.updatedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_inventoryOrder1.updatedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_inventoryOrder1.updatedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_inventoryOrder1.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_inventoryOrder1.tipAmount || 0).toFixed(2)}`,
                    inTakePounds: null,
                    beforeProcessingPounds: null,
                    intakeEmployee: store1_inventoryOrder1_employee?.fullName ?? null,
                    completeProcessingEmployee: null,
                    afterProcessingPounds: null,
                    completionPounds: null,
                    completedEmployee: null,
                    paymentEmployee: store1_inventoryOrder1_employee?.fullName ?? null,
                    washingEmployee: null,
                    dryingEmployee: null,
                    dryingTime: null,
                    intakeTime: null,
                    washingTime: null,
                    paymentMethod: null,
                    totalProcessingTimeStart: null,
                    totalProcessingTimeEnd: null,
                    totalTurnaroundTimeStart: null,
                },
                {
                    orderType: 'SERVICE',
                    orderCode: store1_serviceOrder2.orderCode,
                    completedAt: store1_serviceOrder2.completedAt,
                    completedAtDate: getOrderFormattedDate(
                        store1_serviceOrder2.completedAt,
                        timeZone,
                    ),
                    completedAtTime: getOrderFormattedTime(
                        store1_serviceOrder2.completedAt,
                        timeZone,
                    ),
                    orderTotal: `$${(store1_serviceOrder2.netOrderTotal ?? 0).toFixed(2)}`,
                    tipTotal: `$${(store1_serviceOrder2.tipAmount || 0).toFixed(2)}`,
                    inTakePounds: store1_serviceOrder2_intakeWeight,
                    beforeProcessingPounds: store1_serviceOrder2_beforeProcessingWeight,
                    intakeEmployee: store1_serviceOrder2_activityLogs?.intake?.employeeName ?? null,
                    completeProcessingEmployee:
                        store1_serviceOrder2_activityLogs?.completeProcessing?.employeeName ?? null,
                    afterProcessingPounds: store1_serviceOrder2_afterProcessingWeight,
                    completionPounds: store1_serviceOrder2_completionWeight,
                    completedEmployee:
                        store1_serviceOrder2_activityLogs?.completeOrPickup?.employeeName ?? null,
                    paymentEmployee:
                        store1_serviceOrder2_activityLogs?.completeOrPickup?.employeeName ?? null,
                    washingEmployee: store1_serviceOrder2_washingTurnUser.fullName,
                    dryingEmployee: store1_serviceOrder2_dryingTurnUser.fullName,
                    dryingTime: getOrderFormattedTime(
                        store1_serviceOrder2_dryingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    intakeTime: null,
                    washingTime: getOrderFormattedTime(
                        store1_serviceOrder2_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                    paymentMethod: null,
                    totalProcessingTimeEnd: null,
                    totalTurnaroundTimeStart: null,
                    totalProcessingTimeStart: parseStringToDate(
                        store1_serviceOrder2_washingTurnUser?.updatedAt,
                        timeZone,
                    ),
                },
            ]);
        });
    });
});
