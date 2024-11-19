const moment = require('moment');

const getTimeFromInterval = (startDate, endDate) => {
    if (startDate && endDate) {
        const startDateMoment = moment(startDate);
        const endDateMoment = moment(endDate);
        const hoursRange =
            Math.round(endDateMoment.clone().diff(startDateMoment, 'hours', true) * 100) / 100;

        return hoursRange;
    }
    return null;
};

module.exports = getTimeFromInterval;
