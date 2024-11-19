const { dateFormat } = require('../helpers/dateFormatHelper');

function getDeliveryWindowString(startTime, endTime, storeTimezone) {
    const start = dateFormat(startTime, storeTimezone, 'h:mm a');
    const end = dateFormat(endTime, storeTimezone, 'h:mm a');
    return `${start} - ${end}`;
}

module.exports = {
    getDeliveryWindowString,
};
