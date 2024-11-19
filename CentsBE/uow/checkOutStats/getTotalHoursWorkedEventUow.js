const TeamMembersCheckIn = require('../../models/teamMemberCheckIn');

function floor(value) {
    return Math.floor(value);
}

function getFormattedTime(time) {
    const unitmapping = {
        days: 24 * 60 * 60 * 1000,
        hours: 60 * 60 * 1000,
        minutes: 60 * 1000,
        seconds: 1000,
    };
    const days = floor(time / unitmapping.days);
    const hours = floor((time % unitmapping.days) / unitmapping.hours);
    const minutes = floor((time % unitmapping.hours) / unitmapping.minutes);
    const timeBreakdown = {
        days,
        hours,
        minutes,
    };
    // const seconds = floor((time % unitmapping.minutes) / unitmapping.seconds);
    return timeBreakdown;
}

async function getTotalHoursWorked(payload) {
    const newPayload = payload;
    const { teamMemberId, checkOutTime } = newPayload;
    try {
        const checkedOutUserRecord = await TeamMembersCheckIn.query()
            .where('teamMemberId', teamMemberId)
            .where('checkOutTime', checkOutTime);
        const coTime = new Date(checkOutTime);
        const ciTime = new Date(checkedOutUserRecord[0].checkInTime);
        const milliseconds = Math.round(Math.abs(coTime - ciTime));
        const timeData = getFormattedTime(milliseconds);
        newPayload.hours = timeData.hours;
        newPayload.minutes = timeData.minutes;
        newPayload.checkedInTime = ciTime;
        newPayload.checkedOutTime = coTime;
        return newPayload;
    } catch (e) {
        throw new Error(e.message);
    }
}

module.exports = exports = getTotalHoursWorked;
