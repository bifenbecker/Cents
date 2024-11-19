const moment = require('moment');

require('../../../../testHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { getDeliveryWindowsWithEpochDate } = require('../../../../../services/shifts/queries/timings');
const {
    DAYS_IN_WEEK,
    PST_TIME_ZONE,
    getDayOfWeekWithOffsetIdx,
    getSafeForTestingDateTimeData,
    copyMomentDate,
} = require('../../../../support/dateTimeHelper');

const UNIX_DATE_TIME_STR_00_00 = "1970-01-01T00:00:00.000Z";
const UNIX_DATE_TIME_STR_10_00 = "1970-01-01T10:00:00.000Z";
const UNIX_DATE_TIME_STR_23_30 = "1970-01-01T23:30:00.000Z";

const OWN_DELIVERY = 'OWN_DELIVERY';

const setUnixEpochDate = (startTime) => {
    return copyMomentDate(moment(UNIX_DATE_TIME_STR_00_00), startTime);
};

describe('test timings utility', () => {

    describe('test getDeliveryWindowsWithEpochDate', () => {
        let store, shift;
        beforeEach(async () => {
            store = await factory.create(FN.store);
            shift = await factory.create(FN.shift, { 
                storeId: store.id,
                type: OWN_DELIVERY,
            });
        });

        it('should return all deliveryWindows', async () => {
            const timing = await factory.create(FN.timing, { 
                shiftId: shift.id,
                isActive: true,
                day: getDayOfWeekWithOffsetIdx(2),
                startTime: UNIX_DATE_TIME_STR_10_00,
                endTime: UNIX_DATE_TIME_STR_23_30,
            });

            const res = await getDeliveryWindowsWithEpochDate({
                storeId: store.id,
                type: OWN_DELIVERY,
                // validate: false, // implicitly
                timeZone: PST_TIME_ZONE,
            });

            const expectedTimingProps = {
                day: getDayOfWeekWithOffsetIdx(2).toString(),
                startTime: new Date(UNIX_DATE_TIME_STR_10_00),
                endTime: new Date(UNIX_DATE_TIME_STR_23_30),
            };
            expect(res.length).to.be.eq(DAYS_IN_WEEK);
            const windowsWithTimings = res.filter(w => w.timings.length > 0);
            expect(windowsWithTimings.length).to.be.eq(1);

            const window = windowsWithTimings[0];
            expect(window.day).to.be.eq(Number(expectedTimingProps.day));

            expect(window.timings.length).to.be.eq(1);
            expect(window.timings[0]).to.include({
                id: timing.id,
                day: expectedTimingProps.day,
            });
            expect(window.timings[0].startTime).to.be.equalToDateTime(expectedTimingProps.startTime);
            expect(window.timings[0].endTime).to.be.equalToDateTime(expectedTimingProps.endTime);
            expect(window.timings[0]).to.include.keys(
                'startEpochTime', 
                'currentDay',
                'currentDayOfMonth',
                'currentEpochTime'
            );
        });

        it('should return [] if there is only timing available for today and currentTime does not fit its interval', async () => {
            const dayOfWeekIdx = getDayOfWeekWithOffsetIdx(0);
            const bufferInHours = 1;
            const {
                timeZone,
                safeDateTimeBeforeCurrentDateTime
            } = getSafeForTestingDateTimeData(bufferInHours);


            await factory.create(FN.timing, {
                shiftId: shift.id,
                isActive: true,
                day: `${dayOfWeekIdx}`,
                startTime: setUnixEpochDate(safeDateTimeBeforeCurrentDateTime),
                endTime: UNIX_DATE_TIME_STR_23_30,
            });

            const res = await getDeliveryWindowsWithEpochDate({
                storeId: store.id,
                type: OWN_DELIVERY,
                validate: true,
                bufferInHours,
                timeZone,
                deliveryType: undefined
            });

            expect(res.length).to.be.eq(0);
        });

        it('should return all windows (where only 1 contains 2 timings) if there is only 2 timings available for today and currentTime of one of them does not fit its interval', async () => {
            const dayOfWeekIdx = getDayOfWeekWithOffsetIdx(0);
            const bufferInHours = 1;
            const {
                timeZone,
                safeDateTimeBeforeCurrentDateTime
            } = getSafeForTestingDateTimeData(bufferInHours);

            await factory.create(FN.timing, {
                shiftId: shift.id,
                isActive: true,
                day: `${dayOfWeekIdx}`,
                startTime: setUnixEpochDate(safeDateTimeBeforeCurrentDateTime),
                endTime: UNIX_DATE_TIME_STR_23_30,
            });

            await factory.create(FN.timing, {
                shiftId: shift.id,
                isActive: true,
                day: `${dayOfWeekIdx}`,
                startTime: UNIX_DATE_TIME_STR_23_30,
                endTime: UNIX_DATE_TIME_STR_23_30,
            });

            const res = await getDeliveryWindowsWithEpochDate({
                storeId: store.id,
                type: OWN_DELIVERY,
                validate: true,
                bufferInHours,
                timeZone,
                deliveryType: undefined
            });

            expect(res.length).to.be.eq(DAYS_IN_WEEK);
            const windowsWithTimings = res.filter(e => e.timings.length > 0);
            expect(windowsWithTimings.length).to.be.eq(1);
            expect(windowsWithTimings[0].timings.length).to.be.eq(2);
        });

        it('should return 7 windows each containing timing if there are 7 timings (each per day of the week)', async () => {
            const timingsCreation = Array.from(
                {length: 7}, 
                async (_, day) => await factory.create(FN.timing, {
                    shiftId: shift.id,
                    isActive: true,
                    day: `${day}`,
                    startTime: new Date(UNIX_DATE_TIME_STR_00_00),
                    endTime: new Date(UNIX_DATE_TIME_STR_23_30),
                })
            );
            await Promise.all(timingsCreation);

            const res = await getDeliveryWindowsWithEpochDate({
                storeId: store.id,
                type: OWN_DELIVERY,
                validate: true,
                // timeZone: 'UTC' // implicitly
                deliveryType: undefined
            });

            expect(res.length).to.be.eq(DAYS_IN_WEEK);
            const windowsWithTimings = res.filter(e => e.timings.length === 1);
            expect(windowsWithTimings.length).to.be.eq(DAYS_IN_WEEK);
        });


        it('should return only windows with matching zoneId', async () => {
            const matchingZoneIds = [10, 9];
            const otherZoneIds = [20, 19];
            const dayOfWeekIdx = getDayOfWeekWithOffsetIdx(2);

            const timingWithMatchingZoneIds = await factory.create(FN.timing, {
                shiftId: shift.id,
                isActive: true,
                day: `${dayOfWeekIdx}`,
                startTime: UNIX_DATE_TIME_STR_00_00,
                endTime: UNIX_DATE_TIME_STR_23_30,
            });
            await factory.create(FN.shiftTimingZone, {
                timingId: timingWithMatchingZoneIds.id,
                zoneIds: [...matchingZoneIds],
            });

            const timingWithOtherZoneIds = await factory.create(FN.timing, {
                shiftId: shift.id,
                isActive: true,
                day: `${dayOfWeekIdx}`,
                startTime: UNIX_DATE_TIME_STR_00_00,
                endTime: UNIX_DATE_TIME_STR_23_30,
            });
            await factory.create(FN.shiftTimingZone, {
                timingId: timingWithOtherZoneIds.id,
                zoneIds: [...otherZoneIds],
            });

            const res = await getDeliveryWindowsWithEpochDate({
                storeId: store.id,
                type: OWN_DELIVERY,
                validate: true,
                zoneId: matchingZoneIds[0],
                // timeZone: 'UTC' // implicitly
                deliveryType: undefined
            });
            expect(res.length).to.be.eq(DAYS_IN_WEEK);
            const windowsWithTimings = res.filter(e => e.timings.length === 1);
            expect(windowsWithTimings.length).to.be.eq(1);
            expect(windowsWithTimings[0].timings.length).to.be.eq(1);
            expect(windowsWithTimings[0].timings[0].id).to.be.eq(timingWithMatchingZoneIds.id);
        });
    });

});
