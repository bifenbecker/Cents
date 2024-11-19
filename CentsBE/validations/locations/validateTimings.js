function validateTimings(timings) {
    for (let j = 0; j < timings.length; j++) {
        for (let i = 0; i < timings[j].length; i++) {
            if (
                timings[j][i].startTime !== null &&
                timings[j][i].endTime !== null &&
                timings[j][i].startTime >= timings[j][i].endTime
            ) {
                return false;
            }
        }
    }
    return true;
}
module.exports = exports = validateTimings;
