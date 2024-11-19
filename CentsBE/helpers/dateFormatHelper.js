const momenttz = require('moment-timezone');

momenttz.updateLocale('en', {
    weekdaysShort: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'],
});

function getUnixTimestamp(date, timeZone = 'America/Los_Angeles') {
    return momenttz.unix(Number(date)).tz(timeZone);
}

function dateFormat(date, timeZone = 'America/Los_Angeles', format = 'MM/DD/YYYY, hh:mm A') {
    if (!date) return null;
    return momenttz(date).tz(timeZone).format(format);
}

function dateFormatInRange(
    date,
    timeZone = 'America/Los_Angeles',
    format = 'MM/DD/YYYY, hh:mm A',
    subtract = false,
    addtionalTime = 30,
) {
    if (!date) return null;
    const tzDate = momenttz(date).tz(timeZone);
    if (subtract) {
        const endTime = tzDate.format(format);
        const startTime = tzDate.subtract(addtionalTime, 'm').format(format);
        return `${startTime} - ${endTime}`;
    }
    return `${tzDate.format(format)} - ${tzDate.add(addtionalTime, 'm').format(format)}`;
}

function unixFormatInRange(
    date,
    timeZone = 'America/Los_Angeles',
    format = 'MM/DD/YYYY, hh:mm A',
    addtionalTime = 30,
) {
    if (!date) return null;
    const tzDate = momenttz.unix(date).tz(timeZone);
    return `${tzDate.format(format)} - ${tzDate.add(addtionalTime, 'm').format(format)}`;
}

function unixDateFormat(date, timeZone = 'America/Los_Angeles', format = 'MM/DD/YYYY, hh:mm A') {
    if (!date) return null;
    return momenttz.unix(Number(date)).tz(timeZone).format(format);
}

function formatDateTimeWindow(timeWindow, timeZone, format = 'h:mm A') {
    if (timeWindow.length) {
        return `${unixDateFormat(timeWindow[0] / 1000, timeZone, format)} - ${unixDateFormat(
            timeWindow[1] / 1000,
            timeZone,
            format,
        )}`;
    }
    return unixDateFormat(timeWindow / 1000, timeZone, format);
}

function toDateWithTimezone(dateOrUnixTimestamp, timeZone = 'UTC') {
    return momenttz.tz(dateOrUnixTimestamp, timeZone);
}

function toDayWithTimezone(date = new Date(), timeZone = 'UTC') {
    return momenttz(date).tz(timeZone).day();
}

function utcDate(timeWindow, timeZone) {
    let date = toDateWithTimezone(Number(timeWindow), timeZone);
    date = new Date(
        Date.UTC(
            date.year(),
            date.month(),
            date.date(),
            date.hour(),
            date.minute(),
            date.second(),
            date.millisecond(),
        ),
    );
    return date;
}

function checkTimingTimeChanged(previousTiming, currentTiming) {
    const getTime = (time) => momenttz(time).format('hh:mm:ss');
    return (
        getTime(previousTiming.startTime) !== getTime(currentTiming.startTime) ||
        getTime(previousTiming.endTime) !== getTime(currentTiming.endTime)
    );
}

function addOrSubtractDaysToCurrentDate(days = 1, inTimeStamp = false, isAdd = false, timeZone) {
    const date = isAdd ? momenttz().add(days, 'd') : momenttz().subtract(days, 'd');
    return inTimeStamp ? date.valueOf() : timeZone ? date.tz(timeZone).format() : date.format();
}

function formatDeliveryWindow(window, timeZone, options = {}) {
    const { dateFormat = 'dddd', timeFormat = 'h:mm A' } = options;
    return `${unixDateFormat(window[0] / 1000, timeZone, dateFormat)}, ${formatDateTimeWindow(
        window,
        timeZone,
        timeFormat,
    )}`;
}

module.exports = exports = {
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
};
