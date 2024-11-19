require('../../testHelper');
const { expect, assert } = require('../../support/chaiHelper');
const {
    dateFormat,
    unixDateFormat,
    formatDateTimeWindow,
    dateFormatInRange,
    unixFormatInRange,
    toDateWithTimezone,
    getUnixTimestamp,
    utcDate,
    checkTimingTimeChanged,
    toDayWithTimezone,
    addOrSubtractDaysToCurrentDate,
    formatDeliveryWindow,
} = require('../../../helpers/dateFormatHelper');
const momenttz = require('moment-timezone');
const sinon = require('sinon');

// timestamps in milliseconds
const TIMESTAMP_MS_1 = 1653576451286,
    TIMESTAMP_MS_2 = 1653577255096,
    TIMESTAMP_MS_3 = 1653580060981,
    // in seconds
    TIMESTAMP_SEC_1 = 1653576451;

describe('test dateFormatHelper', () => {
    const timestamp = TIMESTAMP_MS_1,
        timezone = 'America/New_York';

    describe('test dateFormat', () => {
        it('should return null for an empty date', () => {
            const result = dateFormat();
            expect(result).to.be.null;
        });

        it('should return a formatted date with default timezone and format', () => {
            const result = dateFormat(timestamp);
            expect(result).to.equal('05/26/2022, 07:47 AM');
        });

        it('should return a formatted date with set timezone', () => {
            const result = dateFormat(timestamp, timezone);
            expect(result).to.equal('05/26/2022, 10:47 AM');
        });

        it('should return a formatted date with set format', () => {
            const result = dateFormat(timestamp, timezone, 'MM/DD/YYYY');
            expect(result).to.equal('05/26/2022');
        });
    });

    describe('test unixDateFormat', () => {
        const timestamp = TIMESTAMP_SEC_1,
            timezone = 'America/New_York';

        it('should return null for an empty date', () => {
            const result = unixDateFormat();
            expect(result).to.be.null;
        });

        it('should return a formatted date with default timezone and format', () => {
            const result = unixDateFormat(timestamp);
            expect(result).to.equal('05/26/2022, 07:47 AM');
        });

        it('should return a formatted date with set timezone', () => {
            const result = unixDateFormat(timestamp, timezone);
            expect(result).to.equal('05/26/2022, 10:47 AM');
        });

        it('should return a formatted date with set format', () => {
            const result = unixDateFormat(timestamp, timezone, 'MM/DD/YYYY');
            expect(result).to.equal('05/26/2022');
        });
    });

    describe('test formatDateTimeWindow', () => {
        const timestamp = TIMESTAMP_MS_1,
            endTimestamp = TIMESTAMP_MS_2,
            timezone = 'America/Los_Angeles';

        it('should return single formatted date with default format', () => {
            const result = formatDateTimeWindow(timestamp, timezone);
            expect(result).to.equal('7:47 AM');
        });

        it('should return single formatted date with set format', () => {
            const result = formatDateTimeWindow(timestamp, timezone, 'hh:mm A');
            expect(result).to.equal('07:47 AM');
        });

        it('should return formatted date-time window with default format', () => {
            const result = formatDateTimeWindow([timestamp, endTimestamp], timezone);
            expect(result).to.equal('7:47 AM - 8:00 AM');
        });

        it('should return formatted date-time window with set format', () => {
            const result = formatDateTimeWindow([timestamp, endTimestamp], timezone, 'hh:mm A');
            expect(result).to.equal('07:47 AM - 08:00 AM');
        });
    });

    describe('test dateFormatInRange', () => {
        const timestamp = TIMESTAMP_MS_1,
            timezone = 'America/New_York';

        it('should return null for an empty date', () => {
            const result = dateFormatInRange();
            expect(result).to.be.null;
        });

        it('should return a formatted range with default args', () => {
            const result = dateFormatInRange(timestamp);
            expect(result).to.equal('05/26/2022, 07:47 AM - 05/26/2022, 08:17 AM');
        });

        it('should return a formatted range with set timezone', () => {
            const result = dateFormatInRange(timestamp, timezone);
            expect(result).to.equal('05/26/2022, 10:47 AM - 05/26/2022, 11:17 AM');
        });

        it('should return a formatted range with set format', () => {
            const result = dateFormatInRange(timestamp, timezone, 'hh:mm A');
            expect(result).to.equal('10:47 AM - 11:17 AM');
        });

        it('should return a formatted range with subtracted default time', () => {
            const result = dateFormatInRange(timestamp, timezone, 'hh:mm A', true);
            expect(result).to.equal('10:17 AM - 10:47 AM');
        });

        it('should return a formatted range with subtracted time value', () => {
            const result = dateFormatInRange(timestamp, timezone, 'hh:mm A', true, 15);
            expect(result).to.equal('10:32 AM - 10:47 AM');
        });

        it('should return a formatted range with added time value', () => {
            const result = dateFormatInRange(timestamp, timezone, 'hh:mm A', false, 15);
            expect(result).to.equal('10:47 AM - 11:02 AM');
        });
    });

    describe('test unixFormatInRange', () => {
        const timestamp = TIMESTAMP_SEC_1,
            timezone = 'America/New_York';

        it('should return null for an empty date', () => {
            const result = unixFormatInRange();
            expect(result).to.be.null;
        });

        it('should return a formatted range with default args', () => {
            const result = unixFormatInRange(timestamp);
            expect(result).to.equal('05/26/2022, 07:47 AM - 05/26/2022, 08:17 AM');
        });

        it('should return a formatted range with set timezone', () => {
            const result = unixFormatInRange(timestamp, timezone);
            expect(result).to.equal('05/26/2022, 10:47 AM - 05/26/2022, 11:17 AM');
        });

        it('should return a formatted range with set format', () => {
            const result = unixFormatInRange(timestamp, timezone, 'hh:mm A');
            expect(result).to.equal('10:47 AM - 11:17 AM');
        });

        it('should return a formatted range with added time value', () => {
            const result = unixFormatInRange(timestamp, timezone, 'hh:mm A', 15);
            expect(result).to.equal('10:47 AM - 11:02 AM');
        });
    });

    describe('test toDateWithTimezone', () => {
        const timestamp = TIMESTAMP_MS_1;

        it('should return a moment with default timezone', () => {
            const result = toDateWithTimezone(timestamp);

            expect(momenttz.isMoment(result)).to.be.true;
            expect(result.tz()).to.equal('UTC');
        });

        it('should return a moment with set timezone', () => {
            const timeZone = 'America/Los_Angeles';
            const result = toDateWithTimezone(timestamp, timeZone);

            expect(momenttz.isMoment(result)).to.be.true;
            expect(result.tz()).to.equal(timeZone);
        });
    });

    describe('test getUnixTimestamp', () => {
        const date = new Date(TIMESTAMP_MS_1);

        it('should return a moment with default timezone', () => {
            const result = getUnixTimestamp(date);

            expect(momenttz.isMoment(result)).to.be.true;
            expect(result.tz()).to.equal('America/Los_Angeles');
        });

        it('should return a moment with set timezone', () => {
            const timeZone = 'UTC';
            const result = getUnixTimestamp(date, timeZone);

            expect(momenttz.isMoment(result)).to.be.true;
            expect(result.tz()).to.equal(timeZone);
        });
    });

    describe('test utcDate', () => {
        const timestamp = TIMESTAMP_MS_1;

        it('should return a utc date', () => {
            const result = utcDate(timestamp, 'UTC');
            assert.deepEqual(result, new Date('2022-05-26T14:47:31.286Z'));
        });

        it('should return a utc date with timezone offset', () => {
            const timeZone = 'America/Los_Angeles';
            const expectedDate = new Date(
                new Date('2022-05-26T14:47:31.286Z').toLocaleString('en-US', {
                    timeZone,
                }),
            );
            expectedDate.setMilliseconds(286);

            const result = utcDate(timestamp, timeZone);
            assert.deepEqual(result, expectedDate);
        });
    });

    describe('test checkTimingTimeChanged', () => {
        it('should return false if time was not changed', () => {
            const prevTime = {
                    startTime: TIMESTAMP_MS_1,
                    endTime: TIMESTAMP_MS_3,
                },
                currTime = prevTime;

            const result = checkTimingTimeChanged(prevTime, currTime);
            expect(result).to.be.false;
        });

        it('should return true if start time was changed', () => {
            const prevTime = {
                    startTime: TIMESTAMP_MS_1,
                    endTime: TIMESTAMP_MS_3,
                },
                currTime = {
                    startTime: TIMESTAMP_MS_2,
                    endTime: prevTime.endTime,
                };

            const result = checkTimingTimeChanged(prevTime, currTime);
            expect(result).to.be.true;
        });

        it('should return true if end time was changed', () => {
            const prevTime = {
                    startTime: TIMESTAMP_MS_1,
                    endTime: TIMESTAMP_MS_3,
                },
                currTime = {
                    startTime: prevTime.startTime,
                    endTime: 1653580061981,
                };

            const result = checkTimingTimeChanged(prevTime, currTime);
            expect(result).to.be.true;
        });

        it('should return true if both start and end time were changed', () => {
            const prevTime = {
                    startTime: TIMESTAMP_MS_1,
                    endTime: TIMESTAMP_MS_3,
                },
                currTime = {
                    startTime: TIMESTAMP_MS_2,
                    endTime: TIMESTAMP_MS_1,
                };

            const result = checkTimingTimeChanged(prevTime, currTime);
            expect(result).to.be.true;
        });
    });

    describe('test toDayWithTimezone', () => {
        it('should return current day of the week', () => {
            sinon.useFakeTimers(TIMESTAMP_MS_1); // mock new Date() once

            const result = toDayWithTimezone();
            expect(result).to.equal(4);
            sinon.restore();
        });

        it('should return day of the week with default timezone', () => {
            const result = toDayWithTimezone(1653590851286);
            expect(result).to.equal(4);
        });

        it('should return day of the week with set timezone', () => {
            const result = toDayWithTimezone(1653590851286, 'Asia/Shanghai');
            expect(result).to.equal(5); // next day of the week
        });
    });

    describe('test addOrSubtractDaysToCurrentDate', () => {
        beforeEach(() => {
            sinon.useFakeTimers(1656313200000); // 27th June 12:00:00 Am
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should return unix timestamp if timeStamp sent as true and day addition true', () => {
            const result = addOrSubtractDaysToCurrentDate(1, true, true, 'America/Los_Angeles');
            expect(result).to.equal(1656399600000); //28th June
        });

        it('should return unix timestamp with 2 days added', () => {
            const result = addOrSubtractDaysToCurrentDate(2, true, true, 'America/Los_Angeles');
            expect(result).to.equal(1656486000000); //29th June
        });

        it('should return date string if timeStamp sent as false and day addition true', () => {
            const result = addOrSubtractDaysToCurrentDate(1, false, true, 'America/Los_Angeles');
            expect(result).to.equal('2022-06-28T00:00:00-07:00');
        });

        it('should return date string if timeStamp sent as false and day addition false', () => {
            const result = addOrSubtractDaysToCurrentDate(2, false, false, 'America/Los_Angeles');
            expect(result).to.equal('2022-06-25T00:00:00-07:00');
        });

        it('should use current timezone if timeZone is not passeed', () => {
            const result = addOrSubtractDaysToCurrentDate(2, false, true);
            expect(result).to.equal(momenttz().add(2, 'days').format());
        });
    });

    describe('test formatDeliveryWindow', () => {
        const startTimestamp = TIMESTAMP_MS_1,
            endTimestamp = TIMESTAMP_MS_2,
            timezone = 'America/Los_Angeles';

        it('should return formatted date-time window with default options', () => {
            const result = formatDeliveryWindow([startTimestamp, endTimestamp], timezone);
            expect(result).to.equal('Thursday, 7:47 AM - 8:00 AM');
        });

        it('should return formatted date-time window with set date format', () => {
            const result = formatDeliveryWindow([startTimestamp, endTimestamp], timezone, {
                dateFormat: 'ddd',
            });
            expect(result).to.equal('Thurs, 7:47 AM - 8:00 AM');
        });

        it('should return formatted date-time window with set time format', () => {
            const result = formatDeliveryWindow([startTimestamp, endTimestamp], timezone, {
                timeFormat: 'hh:mm',
            });
            expect(result).to.equal('Thursday, 07:47 - 08:00');
        });

        it('should return formatted date-time window with set both date and time formats', () => {
            const result = formatDeliveryWindow([startTimestamp, endTimestamp], timezone, {
                dateFormat: 'ddd',
                timeFormat: 'hh:mm',
            });
            expect(result).to.equal('Thurs, 07:47 - 08:00');
        });
    });
});
