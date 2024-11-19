const axios = require('axios');
const momenttz = require('moment-timezone');
const { GOOGLE_DISTANCE_MATRIX_URL } = require('../../constants/constants');

class DistanceAndDurationService {
    /**
     *
     * @param {Array} originAddress - array of latitude and longitude. ex: [42.373611,-71.110558]
     * @param {Array} destinationAddress - array of arrays with latitude and longitude.
     *  ex: [[42.370696,-71.097737], [42.365525,-71.109965]]
     * @param {string} timezone
     */
    constructor(originAddress, destinationAddress, timezone) {
        this.originAddress = originAddress;
        this.destinationAddress = destinationAddress;
        this.timezone = timezone;
    }

    /**
     *
     * @returns {Array} This function returns array of objects with distance, duration,
     * latitude and longitude data
     */
    async fetchDistanceAndDuration() {
        const res = await axios.get(GOOGLE_DISTANCE_MATRIX_URL, {
            params: this.requestParams,
        });
        if (res.data.rows.length) {
            const path = this.responseFormatter(res.data.rows[0].elements);
            return path;
        }
        return res.data.rows;
    }

    get requestParams() {
        const params = {
            origins: this.originAddress.join(','),
            destinations: this.destinationAddress.map((address) => address.join(',')).join('|'),
            units: 'imperial',
            key: process.env.GOOGLE_PLACES_API_KEY,
            departure_time: momenttz().tz(this.timezone).unix(),
        };
        return params;
    }

    responseFormatter(elements) {
        const noResults = elements.filter((ele) => ele.status === 'ZERO_RESULTS');
        if (noResults.length) {
            throw new Error(
                'Route is not possible for the selected origin and destination addresses',
            );
        }
        return elements.map((ele, key) => ({
            durationInSeconds: ele.duration.value,
            lat: this.destinationAddress[key][0],
            lng: this.destinationAddress[key][1],
            distanceInMiles: ele.distance.text,
            distanceInMeters: ele.distance.value,
            estimatedTime: ele.duration.text,
            estimatedTimeArrival: this.estimatedTimeOfArrival(ele.duration.value),
        }));
    }

    estimatedTimeOfArrival(eta) {
        const totalEstimatedTime = momenttz().tz(this.timezone).unix() + eta;
        return totalEstimatedTime;
    }
}
module.exports = exports = DistanceAndDurationService;
