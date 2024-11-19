require('../../../testHelper');
const mockDate = require('mockdate');
const { expect } = require('../../../support/chaiHelper');
const {
    getFormattedStartAndEndDates,
    buildStatusesMap,
    getSubscriptionFutureDates,
    mapInventoryOrderDetails,
    formatDateRangeForReportTitle,
    getPaymentType,
    getReportOptions,
    mapCustomersReportResponse,
} = require('../../../../utils/reports/reportsUtils');
const factory = require('../../../factories');
const momenttz = require('moment-timezone');
const orderId = 1;
const id = 1;

describe('test reportsUtils', () => {
    describe('test getFormattedStartAndEndDates', () => {
        it('should get formatted start and end dates successfully', async () => {
            const startDate = new Date().toISOString();
            const endDate = new Date().toISOString();
            const timeZone = 'America/New_York';
            let formattedStartDate = new Date()
                .toLocaleDateString('en-US', {
                    timeZone: timeZone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })
                .replace(/\//g, '-');
            let formattedEndDate = new Date()
                .toLocaleDateString('en-US', {
                    timeZone: timeZone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })
                .replace(/\//g, '-');

            expect(getFormattedStartAndEndDates(startDate, endDate, timeZone)[0]).to.eq(
                `${formattedStartDate} 00:00:00`,
            );
            expect(getFormattedStartAndEndDates(startDate, endDate, timeZone)[1]).to.eq(
                `${formattedEndDate} 23:59:59`,
            );
        });
    });

    describe('test mapInventoryOrderDetails', () => {
        it('should map inventory order details successfully', async () => {
            const timezone = 'America/New_York';
            const user = await factory.build('user', { id });
            const store = await factory.build('store', { id });
            const centsCustomer = await factory.build('centsCustomer');
            const storeCustomer = await factory.build('storeCustomer', {
                id,
                centsCustomer: centsCustomer,
            });
            const teamMember = await factory.build('teamMember', {
                id,
                user: user,
            });
            const orderDelivery1 = await factory.build('orderDelivery', {
                orderId,
                type: 'RETURN',
                status: 'SUBMITTED',
                totalDeliveryCost: 13.0,
            });
            const orderDelivery2 = await factory.build('orderDelivery', {
                orderId,
                type: 'PICKUP',
                status: 'SUBMITTED',
                totalDeliveryCost: 23.0,
            });
            const order = await factory.build('order', {
                delivery: orderDelivery1,
                pickup: orderDelivery2,
            });
            const payments = await factory.build('payments', {
                orderId: order.id,
                paymentProcessor: 'stripe',
                customerId: user.id,
                orderId,
                storeId: store.id,
                esdReceiptNumber: '123',
                status: 'succeeded',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const inventoryOrder = await factory.build('inventoryOrder', {
                customerId: user.id,
                lineItems: [await factory.build('inventoryOrderItem')],
                createdAt: new Date().toISOString(),
                order: order,
                store: store,
                customer: storeCustomer,
                employee: teamMember,
                netOrderTotal: 0,
                orderCode: '15',
                storeCustomerId: storeCustomer.id,
                storeId: store.id,
                employeeId: teamMember.id,
                status: 'COMPLETED',
            });

            expect(mapInventoryOrderDetails(inventoryOrder, timezone)).to.not.eq(null);
            expect(mapInventoryOrderDetails(inventoryOrder, timezone)[0]).to.eq(
                `INV-${inventoryOrder.orderCode}`,
            );
            expect(mapInventoryOrderDetails(inventoryOrder, timezone)[1]).to.eq(store.address);
            expect(mapInventoryOrderDetails(inventoryOrder, timezone)[4]).to.eq(
                `${storeCustomer.firstName} ${storeCustomer.lastName}`,
            );
            expect(mapInventoryOrderDetails(inventoryOrder, timezone)[9]).to.eq(
                `${user.firstname} ${user.lastname}`,
            );
            expect(mapInventoryOrderDetails(inventoryOrder, timezone)[16]).to.eq(
                inventoryOrder.status,
            );
        });
    });

    describe('test formatDateRangeForReportTitle', () => {
        it('should return formatted date range for report title', async () => {
            const startDate = new Date();
            const endDate = new Date();
            const timeZone = 'America/New_York';
            let formattedStartDate = startDate
                .toLocaleDateString('en-US', {
                    timeZone: timeZone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })
                .replace(/\//g, '-');
            let formattedEndDate = endDate
                .toLocaleDateString('en-US', {
                    timeZone: timeZone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })
                .replace(/\//g, '-');
            expect(formatDateRangeForReportTitle(startDate, endDate, timeZone)).to.eq(
                `${formattedStartDate}-${formattedEndDate}`,
            );
        });
    });

    describe('test buildStatusesMap', () => {
        it('should build array of objects from array', () => {
            const statuses = ['SUBMITTED', 'READY_FOR_PROCESSING'];
            const result = buildStatusesMap(statuses);
            expect(result[0].name).to.equal('SUBMITTED');
            expect(result[1].name).to.equal('READY_FOR_PROCESSING');
        });

        it('should set last key to true for last element', () => {
            const statuses = ['SUBMITTED', 'READY_FOR_PROCESSING'];
            const result = buildStatusesMap(statuses);
            expect(result[0]).not.to.have.property('last');
            expect(result[1].last).to.equal(true);
        });
    });

    describe('test getSubscriptionFutureDates', () => {
        const timeZone = 'America/New_York';
        describe('when start date is greater than today', () => {
            it('should return the same startDate and endDate as futureStartDate and futureEndDate', async () => {
                const startDate = momenttz.tz(timeZone).add(2, 'days');
                const endDate = startDate.add(2, 'days');
                expect(getSubscriptionFutureDates(startDate, endDate, timeZone)).to.deep.eq([
                    startDate,
                    endDate,
                ]);
            });
        });

        describe('when endDate is in past', () => {
            it('should return empty array', async () => {
                const startDate = momenttz.tz(timeZone).subtract(2, 'days');
                const endDate = startDate.subtract(2, 'days');
                expect(getSubscriptionFutureDates(startDate, endDate, timeZone)).to.deep.eq([]);
            });
        });

        describe('when start date is today and before 7pm', () => {
            let startDate, endDate;
            beforeEach(() => {
                startDate = momenttz.tz(timeZone).subtract(2, 'days');
                endDate = momenttz.tz(timeZone).add(2, 'days');
            });

            afterEach(() => {
                mockDate.reset();
            });
            it('should return futureStartDate as 1 day from now', async () => {
                now = startDate.set('hour', 8).toDate().toISOString();
                mockDate.set(now);
                expect(getSubscriptionFutureDates(startDate, endDate, timeZone)).to.deep.eq([
                    momenttz
                        .tz(timeZone)
                        .add(1, 'day')
                        .startOf('day')
                        .format('MM-DD-YYYY HH:mm:ss'),
                    endDate,
                ]);
            });
            it('should return futureStartDate as 2 days from now', async () => {
                now = startDate.set('hour', 20).toDate().toISOString();
                mockDate.set(now);
                expect(getSubscriptionFutureDates(startDate, endDate, timeZone)).to.deep.eq([
                    momenttz
                        .tz(timeZone)
                        .add(2, 'day')
                        .startOf('day')
                        .format('MM-DD-YYYY HH:mm:ss'),
                    endDate,
                ]);
            });
        });
    });

    describe('test getPaymentType', () => {
        it('shoud return creditCard for credit cards payments', () => {
            expect(getPaymentType('stripe')).to.equal('creditCard');
        });

        it('shoud return cash for cash payments', () => {
            expect(getPaymentType('cash')).to.equal('cash');
        });

        it('shoud return cashCard for cash cards payments', () => {
            expect(getPaymentType('cashCard')).to.equal('cashCard');
            expect(getPaymentType('ESD')).to.equal('cashCard');
            expect(getPaymentType('CCI')).to.equal('cashCard');
            expect(getPaymentType('Laundroworks')).to.equal('cashCard');
        });
    });

    describe('test getReportOptions', () => {
        const {ORDER_STATUS_PARAM_VALUES} = require('../../../../constants/constants');
        const date = new Date().toISOString();
        const optionAvailableStatuses = [
            'statusCompleted',
            'statusCompletedAndActive',
            'statusCompletedAndCancelled',
            'statusActive',
            'statusActiveAndCancelled',
            'statusCancelled'
        ];
        const params = {
            businessId: id,
            startDate: date,
            endDate: date,
            stores: [],
        };
        let expectedStatus = null;

        const getReportOptionsByStatus = (status) => getReportOptions({...params, status});
        const getOptionAvailableStatusesExceptExpected = () => optionAvailableStatuses.filter(status => status !== expectedStatus);

        it('should retrieve an object',function(){
            const options = getReportOptions({...params});

            expect(options).to.be.an('object');
        })

        it('should be options with status equals completed', () => {
            expectedStatus = 'statusCompleted';
            const options = getReportOptionsByStatus(ORDER_STATUS_PARAM_VALUES.COMPLETED);

            expect(options).to.have.property(expectedStatus).equal(true);
            expect(options).not.to.have.keys(getOptionAvailableStatusesExceptExpected());
        });

        it('should be options with status equals completed and active', () => {
            expectedStatus = 'statusCompletedAndActive';
            const options = getReportOptionsByStatus(ORDER_STATUS_PARAM_VALUES.COMPLETED_ACTIVE);

            expect(options).to.have.property(expectedStatus).equal(true);
            expect(options).not.to.have.keys(getOptionAvailableStatusesExceptExpected());
        });

        it('should be options with status equals completed and cancelled', () => {
            expectedStatus = 'statusCompletedAndCancelled';
            const options = getReportOptionsByStatus(ORDER_STATUS_PARAM_VALUES.COMPLETED_CANCELLED);

            expect(options).to.have.property(expectedStatus).equal(true);
            expect(options).not.to.have.keys(getOptionAvailableStatusesExceptExpected());
        });

        it('should be options with status equals active', () => {
            expectedStatus = 'statusActive';
            const options = getReportOptionsByStatus(ORDER_STATUS_PARAM_VALUES.ACTIVE);

            expect(options).to.have.property(expectedStatus).equal(true);
            expect(options).not.to.have.keys(getOptionAvailableStatusesExceptExpected());
        });

        it('should be options with status equals active and cancelled', () => {
            expectedStatus = 'statusActiveAndCancelled';
            const options = getReportOptionsByStatus(ORDER_STATUS_PARAM_VALUES.ACTIVE_CANCELLED);

            expect(options).to.have.property(expectedStatus).equal(true);
            expect(options).not.to.have.keys(getOptionAvailableStatusesExceptExpected());
        });

        it('should be options with status equals cancelled', () => {
            expectedStatus = 'statusCancelled';
            const options = getReportOptionsByStatus(ORDER_STATUS_PARAM_VALUES.CANCELLED);

            expect(options).to.have.property(expectedStatus).equal(true);
            expect(options).not.to.have.keys(getOptionAvailableStatusesExceptExpected());
        });

        it('should be options with any status', () => {
            expectedStatus = null;
            const options = getReportOptionsByStatus(ORDER_STATUS_PARAM_VALUES.COMPLETED_ACTIVE_CANCELLED);

            expect(options).not.to.have.keys(getOptionAvailableStatusesExceptExpected());
        });
    });

    describe('test mapCustomersReportResponse', () => {
        const timeZone = 'America/New_York';
        const currentDate = momenttz().tz(timeZone);
        function getCustomer(isCommercial) {
            return {
               totalOrders: '10',
               firstOrderDate: '2022-05-10T12:59:32.582Z',
               lastOrderDate: '2022-06-10T12:59:32.582Z',
               isCommercial: isCommercial,
            }
        }

        it('should return response where customerType is commercial', () => {
            const isCommercial = true;
            const res = mapCustomersReportResponse(getCustomer(isCommercial), timeZone);
            expect(res.totalOrders).to.eq(Number(getCustomer(isCommercial).totalOrders));
            expect(res.customerType).to.eq('Commercial');
            expect(res.daysSinceLastOrder).to.eq(
                currentDate.startOf('day').diff(
                    momenttz(getCustomer(isCommercial).lastOrderDate)
                        .tz('America/New_York')
                        .startOf('day'),
                    'days'
                )
            );
        });

        it('should return response where customerType is residential', () => {
            const isCommercial = false;
            const res = mapCustomersReportResponse(getCustomer(isCommercial), timeZone);
            expect(res.totalOrders).to.eq(Number(getCustomer(isCommercial).totalOrders));
            expect(res.customerType).to.eq('Residential');
            expect(res.daysSinceLastOrder).to.eq(
                currentDate.startOf('day').diff(
                    momenttz(getCustomer(isCommercial).lastOrderDate)
                        .tz('America/New_York')
                        .startOf('day'),
                    'days'
                )
            );
        });

        it('should throw an error if params not passed', () => {
            expect(mapCustomersReportResponse).to.throw();
        });
    });
});
