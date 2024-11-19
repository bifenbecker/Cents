const moment = require('moment');

require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const {
    assertGetResponseSuccess,
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { orderDeliveryStatuses } = require('../../../../constants/constants');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    DAYS_IN_WEEK,
    PST_TIME_ZONE,
    getDayOfWeekWithOffsetIdx,
    getSafeForTestingDateTimeData,
    copyMomentDate,
} = require('../../../support/dateTimeHelper');

const UNIX_DATE_TIME_STR_10_00 = "1970-01-01T10:00:00.000Z";
const UNIX_DATE_TIME_STR_23_30 = "1970-01-01T23:30:00.000Z";

const OWN_DELIVERY = 'OWN_DELIVERY';

describe('test ownNetworkDeliveryController', () => {
    describe('test /api/v1/employee-tab/delivery/own-network/time-windows endpoint', () => {
        const API_ENDPOINT = '/api/v1/employee-tab/delivery/own-network/time-windows';
        
        let store, shift, token;
        beforeEach(async () => {
            store = await factory.create(FN.store);
            shift = await factory.create(FN.shift, { 
                storeId: store.id,
                type: OWN_DELIVERY,
            });
            token = await generateToken({ id: store.id });
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => API_ENDPOINT
        );

        it('should successfully get all windows', async () => {
            const timing = await factory.create(FN.timing, { 
                shiftId: shift.id,
                isActive: true,
                day: getDayOfWeekWithOffsetIdx(2),
                startTime: UNIX_DATE_TIME_STR_10_00,
                endTime: UNIX_DATE_TIME_STR_23_30,
            });
    
            const { body } = await assertGetResponseSuccess({ token, url: API_ENDPOINT, });
            expect(body.success).to.be.true;
            expect(body.timeWindows.length).to.be.eq(DAYS_IN_WEEK);
            const windowsWithTimings = body.timeWindows.filter(w => w.timings.length > 0);
            expect(windowsWithTimings.length).to.be.eq(1);
            const window = windowsWithTimings[0];
            expect(window.timings[0]).to.include({
                id: timing.id,
                day: timing.day.toString(),
            });
        });
    
        it('should return [] if there are no timings available', async () => {
            const { body } = await assertGetResponseSuccess({ token, url: API_ENDPOINT, });
            expect(body.success).to.be.true;
            expect(body.timeWindows.length).to.be.eq(0);
        });
    });

    describe('test /api/v1/employee-tab/delivery/own-network/ready/all endpoint', () => {
        const API_ENDPOINT = '/api/v1/employee-tab/delivery/own-network/ready/all';

        let store, shift, token;
        beforeEach(async () => {
            store = await factory.create(FN.store);
            shift = await factory.create(FN.shift, { 
                storeId: store.id,
                type: OWN_DELIVERY,
            });
            token = await generateToken({ id: store.id });
        });
    
        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => API_ENDPOINT,
        );

        it('should return empty today and tomorrow deliveries lists if there is no time windows', async () => {
            const storeSettings = store.getStoreSettings();
            await storeSettings.update({
                timeZone: PST_TIME_ZONE,
            }).execute();
    
            const { body } = await assertGetResponseSuccess({ token, url: API_ENDPOINT, });
            expect(body.success).to.be.true;
            expect(body.today.length).to.be.equal(0);
            expect(body.tomorrow.length).to.be.equal(0);
            expect(body.timeZone).to.be.eq(PST_TIME_ZONE);
        });
    
        it('should return today and tomorrow windows containing no deliveries if there is no order deliveries', async () => {
            const storeSettings = store.getStoreSettings();
            await storeSettings.update({
                timeZone: PST_TIME_ZONE,
            }).execute();
    
            for(const dayIdx of [0,1,2]) {
                await factory.create(FN.timing, { 
                    shiftId: shift.id,
                    isActive: true,
                    day: getDayOfWeekWithOffsetIdx(dayIdx),
                    startTime: UNIX_DATE_TIME_STR_10_00,
                    endTime: UNIX_DATE_TIME_STR_23_30,
                });
            }

    
            const { body } = await assertGetResponseSuccess({ token, url: API_ENDPOINT, });
            expect(body.success).to.be.true;
    
            expect(body.today.length).to.be.equal(1);
            expect(body.today[0].deliveries.length).to.be.equal(0);
    
            expect(body.tomorrow.length).to.be.equal(1);
            expect(body.tomorrow[0].deliveries.length).to.be.equal(0);
    
            expect(body.timeZone).to.be.eq(PST_TIME_ZONE);
        });
    
        it('should return today and tomorrow windows containing deliveries', async () => {
            const {timeZone} = getSafeForTestingDateTimeData();
            
            const storeSettings = store.getStoreSettings();
            await storeSettings.update({timeZone}).execute();
            // today
            await factory.create(FN.timing, { 
                shiftId: shift.id,
                isActive: true,
                day: getDayOfWeekWithOffsetIdx(0),
                startTime: UNIX_DATE_TIME_STR_10_00,
                endTime: UNIX_DATE_TIME_STR_23_30,
            });
            // tomorrow
            const timingForTomorrow = await factory.create(FN.timing, { 
                shiftId: shift.id,
                isActive: true,
                day: getDayOfWeekWithOffsetIdx(1),
                startTime: UNIX_DATE_TIME_STR_10_00,
                endTime: UNIX_DATE_TIME_STR_23_30,
            });
    
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                netOrderTotal: 100,
            });
            const order = await factory.create(FN.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
    
            const tomorrow = moment().add(1, 'day');
            const deliveryWindow1 = copyMomentDate(tomorrow, moment.utc(UNIX_DATE_TIME_STR_10_00));
            const deliveryWindow2 = copyMomentDate(tomorrow, moment.utc(UNIX_DATE_TIME_STR_23_30));
    
            await factory.create(FN.orderDelivery, {
                orderId: order.id,
                storeId: store.id,
                status: orderDeliveryStatuses.SCHEDULED,
                deliveryProvider: 'OWN_DRIVER',
                timingsId: timingForTomorrow.id,
                deliveryWindow: [
                    deliveryWindow1.unix() * 1000, 
                    deliveryWindow2.unix() * 1000
                ]
            });
    
            const { body } = await assertGetResponseSuccess({ token, url: API_ENDPOINT, });
            expect(body.success).to.be.true;
    
            expect(body.today.length).to.be.equal(1);
            expect(body.today[0].deliveries.length).to.be.equal(0);
    
            expect(body.tomorrow.length).to.be.equal(1);
            expect(body.tomorrow[0].deliveries.length).to.be.equal(1);
    
            expect(body.timeZone).to.be.eq(timeZone);
        });
    
    });
});