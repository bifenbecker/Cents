const momentTz = require('moment-timezone');

function formattedTime(date, timeZone = 'UTC', format = 'MM/DD/YYYY hh:mm A') {
    if (!date) return null;
    return momentTz(date).tz(timeZone).format(format);
}
module.exports = { formattedTime };
