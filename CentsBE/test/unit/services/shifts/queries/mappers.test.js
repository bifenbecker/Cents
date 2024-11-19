require('../../../../testHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { mapTimings, mapTimingsAccordingToDays } = require('../../../../../services/shifts/queries/mappers');

const DATE_TIME_STR_00_00 = "1970-01-01T00:00:00.000Z";
const DATE_TIME_STR_10_00 = "1970-01-01T10:00:00.000Z";
const DATE_TIME_STR_14_30 = "1970-01-01T14:30:00.000Z";
const DATE_TIME_STR_15_00 = "1970-01-01T15:00:00.000Z";
const DATE_TIME_STR_23_30 = "1970-01-01T23:30:00.000Z";

const getEpochTime = (dateString) => Number(new Date(dateString));

const DEFAULT_CURRENT_DATA = {
    currentDayOfMonth: 17,
    currentDay: 2,
    currentEpochTime: getEpochTime(DATE_TIME_STR_10_00),
};
const getWindows = (currentData) => [
    {
        id: 1,
        day: "0",
        startTime: DATE_TIME_STR_00_00,
        endTime: DATE_TIME_STR_14_30,
        startEpochTime: getEpochTime(DATE_TIME_STR_00_00),
        ...DEFAULT_CURRENT_DATA,
        ...currentData
    },
    {
        id: 2,
        day: "0",
        startTime: DATE_TIME_STR_15_00,
        endTime: DATE_TIME_STR_23_30,
        startEpochTime: getEpochTime(DATE_TIME_STR_15_00),
        ...DEFAULT_CURRENT_DATA,
        ...currentData
    },
    {
        id: 3,
        day: "1",
        startTime: DATE_TIME_STR_00_00,
        endTime: DATE_TIME_STR_23_30,
        startEpochTime: getEpochTime(DATE_TIME_STR_00_00),
        ...DEFAULT_CURRENT_DATA,
        ...currentData
    },
];

/**
 * Groups windows by day so windows[] becomes days[{day, timings[windows]}]
 * @param {[]} windows - array of timing windows
 * @param {bool} onlyDaysWithTimings - return only entries with timings
 * @returns 
 */
const getExpectedMappedTimings = (windows, onlyDaysWithTimings = false) => {
    const mappedTimings = Array.from({length: 7}, (_, day) => ({
        day,
        timings: windows.filter(w => Number(w.day) === day) 
    }));
    return onlyDaysWithTimings
        ? mappedTimings.filter(e => e.timings.length > 0)
        : mappedTimings;
};

describe('test shifts query mappers', () => {
    describe('test mapTimings', () => {
        it('mapTimings should correctly map passed windows', () => {
            const mappedTimings = mapTimings( getWindows() );
            expect(mappedTimings).to.be.eql( 
                getExpectedMappedTimings( getWindows() ) 
            );
        });
    
        it('mapTimings should return empty array if none windows are passed', () => {
            const mappedTimings = mapTimings([]);
            expect(mappedTimings).to.be.eql([]);
        });
    });

    describe('test mapTimingsAccordingToDays', () => {
        it('mapTimingsAccordingToDays should correctly map passed windows', async () => {
            const mappedTimings = await mapTimingsAccordingToDays( getWindows() );
            expect(mappedTimings).to.be.eql( 
                getExpectedMappedTimings( getWindows() ) 
            );
        });

        it('should correctly map passed windows when there is currentDay match within available timing', async () => {
            const currentDayAndEpochTime = {
                currentDay: 0,
                currentEpochTime: getEpochTime(DATE_TIME_STR_10_00)
            };
            const mappedTimings = await mapTimingsAccordingToDays( getWindows(currentDayAndEpochTime) );
            expect(mappedTimings).to.be.eql(
                getExpectedMappedTimings( getWindows(currentDayAndEpochTime) )
            );
        });

        it('should correctly map passed windows when there is currentDay match but not within available timing', async () => {
            const currentDayAndEpochTime = {
                currentDay: 1,
                currentEpochTime: getEpochTime(DATE_TIME_STR_10_00)
            };
            const mappedTimings = await mapTimingsAccordingToDays( getWindows(currentDayAndEpochTime) );
            expect(mappedTimings).to.be.eql(
                getExpectedMappedTimings( getWindows(currentDayAndEpochTime) )
            );
        });

        it('mapTimingsAccordingToDays should correctly map passed windows for OWN_DRIVER delivery case', async () => {
            const windows = getWindows();
            const timings = [];
            for(const idx of [0,1,2]) {
                const {startTime, endTime} = windows[idx];
                const timing = await factory.create(FN.timing, {
                    startTime,
                    endTime,
                });
                timings.push(timing);
                windows[idx].id = timing.id;
            }

            const deliveryTimingSettingsCreation = timings.map(
                async (timing) => await factory.create(FN.deliveryTimingSetting, {
                    timingsId: timing.id,
                    maxStops: null,
                    serviceType: 'ALL'
                })
            );
            await Promise.all(deliveryTimingSettingsCreation);

            const mappedTimings = await mapTimingsAccordingToDays([...windows], 'OWN_DRIVER');
            expect(mappedTimings).to.be.eql(getExpectedMappedTimings([...windows], true));
        });

        it('mapTimingsAccordingToDays should return an empty array if there is no available timings', async () => {
            const windows = getWindows();

            const mappedTimings = await mapTimingsAccordingToDays(windows, 'OWN_DRIVER');
            expect(mappedTimings).to.be.eql([]);
        });

        it('mapTimingsAccordingToDays should return an empty array if none windows are passed', async () => {
            const mappedTimings = await mapTimingsAccordingToDays([]);
            expect(mappedTimings).to.be.eql([]);
        });
    });
});
