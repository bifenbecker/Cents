const moment = require('moment');

const generateDeliveryDays = ({ timeZone, startTime, customerZipCode }) => {
    const weekArray = Array(7).fill();
    const currentTime = moment(startTime).tz(timeZone).set({ hours: 0, minutes: 0, seconds: 0 });
    const daysArray = weekArray.map((element, index) => {
        const momentDay = moment(currentTime).add(index, 'days');
        return {
            customerZipCode,
            timeZone,
            date: momentDay,
            dayOfWeek: momentDay.day(),
            ownDelivery: [],
            onDemandDelivery: [],
        };
    });
    return daysArray;
};

module.exports = { generateDeliveryDays };
