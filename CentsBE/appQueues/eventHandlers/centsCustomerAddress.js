const getLocationDetails = require('../../services/googlePlaces/getPlaceDetails');
const CentsCustomerAddress = require('../../models/centsCustomerAddress');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function updateLatitudeAndLongitude(job, done) {
    try {
        const { customerAddress } = job.data;
        const addressString = [
            customerAddress.address1,
            customerAddress.city,
            customerAddress.firstLevelSubdivisionCode,
            customerAddress.countryCode,
            customerAddress.postalCode,
        ]
            .filter((ele) => ele)
            .join(', ');
        const locationDetails = await getLocationDetails(addressString);
        if (locationDetails) {
            const details = {
                ...locationDetails.geometry.location,
            };

            await CentsCustomerAddress.query().patch(details).findById(customerAddress.id);
        }
        done();
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error occurred in centsCustomerAddressHandler.',
            job,
        });

        done(error);
    }
}

module.exports = exports = { updateLatitudeAndLongitude };
