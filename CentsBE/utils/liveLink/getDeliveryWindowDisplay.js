const moment = require('moment');
const { NAMED_DAYS } = require('../../constants/constants');

const getDeliveryWindowDisplay = ({
    timeZone,
    momentStartTime,
    momentEndTime,
    deliveryFeeInCents,
}) => {
    const currentTime = moment().tz(timeZone);
    const isToday = momentStartTime.isSame(currentTime, 'day');
    const displayDate = isToday ? NAMED_DAYS.TODAY : momentStartTime.format('dddd, MMM DD');
    const deliveryDisplay = {
        displayDate,
        startTime: momentStartTime.format('hh:mmA'),
        endTime: momentEndTime.format('hh:mmA'),
        price: deliveryFeeInCents ? `$${(deliveryFeeInCents / 100).toFixed(2)} one way` : 'Free',
    };
    return deliveryDisplay;
};

module.exports = {
    getDeliveryWindowDisplay,
};
