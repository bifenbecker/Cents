const moment = require('moment');

function updateTime(targetObj, sourceObj) {
    targetObj.hours(sourceObj.getUTCHours());
    targetObj.minutes(sourceObj.getUTCMinutes());
    targetObj.seconds(sourceObj.getUTCSeconds());
    targetObj.milliseconds(sourceObj.getUTCMilliseconds());

    return targetObj;
}

function getTimeStampRangeForTiming(dateObj, shiftTiming, timeZone) {
    const range = [];

    let targetObj = moment(dateObj.getTime()).tz(timeZone || 'UTC');
    const { endTime } = shiftTiming;
    updateTime(targetObj, shiftTiming.startTime);
    range.push(+targetObj);
    updateTime(targetObj, shiftTiming.endTime);
    if (
        endTime.getUTCHours() === 0 &&
        endTime.getUTCMinutes() === 0 &&
        endTime.getUTCSeconds() === 0
    ) {
        targetObj = targetObj.add(1, 'day');
    }
    range.push(+targetObj);

    return range;
}

module.exports = getTimeStampRangeForTiming;
