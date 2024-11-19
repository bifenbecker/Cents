const moment = require('moment');

const DAYS_IN_WEEK = 7;
const PST_TIME_ZONE = 'America/Los_Angeles';
const PST_TIME_ZONE_MAX_OFFSET = 8; // 8 hours is max offset from UTC for PST_TIME_ZONE

/**
 * UTC, Sunday (0) to Saturday (6)
 */
const getDayOfWeekWithOffsetIdx = (daysToBeAdded = 0) =>
    moment().utc().add(daysToBeAdded, 'days').day();

/**
 * Helper for testing logic involving evaluation of `currentDateTime`
 * to make sure that `current date` is not changed during testing.
 * Returns an object with following props
 * - `safeDateTimeBeforeCurrentDateTime` - moment `dateTime` which is earlier than (`currentDateTime` - `bufferInHours`).
 * - `timeZone` of `safeDateTimeBeforeCurrentDateTime` (PST_TIME_ZONE or UTC)
 * - `bufferInHours` which is used to evaluate safe dateTime and timeZone values
 * @param {number} bufferInHours
 */
const getSafeForTestingDateTimeData = (bufferInHours = 1) => {
    const currentDateTimeUTC = moment().utc();
    const tomorrowDateTimeUTC = moment().utc().add(1, 'day').startOf('day');
    const isWithinBufferHours = currentDateTimeUTC.isBetween(
        tomorrowDateTimeUTC.subtract(bufferInHours, 'hour'),
        tomorrowDateTimeUTC,
    );

    // using PST_TIME_ZONE if there is a chance that currentDay changes during the test run
    const timeZone = isWithinBufferHours ? PST_TIME_ZONE : 'UTC';
    const safeDateTimeBeforeCurrentDateTime = isWithinBufferHours
        ? moment().utc().subtract(PST_TIME_ZONE_MAX_OFFSET, 'hours')
        : currentDateTimeUTC;

    return {
        bufferInHours,
        timeZone,
        safeDateTimeBeforeCurrentDateTime,
    };
};

const copyMomentDate = (sourceMomentObj, destinationMomentObj) => {
    destinationMomentObj.date(sourceMomentObj.date());
    destinationMomentObj.month(sourceMomentObj.month());
    destinationMomentObj.year(sourceMomentObj.year());
    return destinationMomentObj;
};

function twoDigit(number) {
    let twodigit = number >= 10 ? number : '0' + number.toString();
    return twodigit;
}

const getTimeDifference = (
    startTime,
    endTime,
    timeZone,
    { inHours = false, inMinutes = false, inSeconds = false },
) => {
    if (!startTime || !endTime) return null;
    const duration = moment.duration(
        moment(moment(endTime).tz(timeZone)).diff(moment(startTime).tz(timeZone)),
    );
    return twoDigit(
        inHours
            ? duration.asHours()
            : inMinutes
            ? duration.asMinutes()
            : inSeconds
            ? duration.asSeconds()
            : 0,
    );
};

module.exports = {
    DAYS_IN_WEEK,
    PST_TIME_ZONE,
    PST_TIME_ZONE_MAX_OFFSET,
    getDayOfWeekWithOffsetIdx,
    getSafeForTestingDateTimeData,
    copyMomentDate,
    getTimeDifference,
};
