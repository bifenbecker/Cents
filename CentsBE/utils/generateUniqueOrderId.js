// eslint-disable-next-line import/no-unresolved
const hash = require('object-hash');

// returned date could be the same for input dates ranging between 1 sec and (2 * secondsRange) secs from one another
function roundToSecRange(date, secondsRange = 5) {
    const ms = 1000 * secondsRange;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

function generateUniqueOrderId(params, date = new Date()) {
    return hash({
        ...params,
        ts: roundToSecRange(date),
    });
}

module.exports = generateUniqueOrderId;
