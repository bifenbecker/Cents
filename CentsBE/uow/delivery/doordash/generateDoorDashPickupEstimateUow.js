// packages
const axios = require('axios');

// models
const Store = require('../../../models/store');
const Business = require('../../../models/laundromatBusiness');

// utils / shared functions
const { setPickupAndDropoffAddresses } = require('../../../routes/live-link/doordash/utils');
const getLocationFromPlaceId = require('../../../services/googlePlaces/getLocationFromPlaceId');
const { toDateWithTimezone } = require('../../../helpers/dateFormatHelper');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
/**
 * Generate a DoorDash estimate to determine deliverability for a delivery request
 *
 * @param {Object} payload
 */
async function generateDoorDashPickupEstimate(payload) {
    const newPayload = payload;

    try {
        const {
            onDemandDeliveryStore: { id: storeId },
            googlePlacesId,
            transaction,
            zipCode,
        } = newPayload;

        const customerAddress = await getLocationFromPlaceId(googlePlacesId);

        if (!customerAddress) {
            return newPayload;
        }
        // there is a issue in customerAddress formation so adding zipCode manually
        customerAddress.postalCode = zipCode;

        const store = await Store.query(transaction).findById(storeId);
        const [pickupAddress, dropoffAddress] = setPickupAndDropoffAddresses(
            store,
            customerAddress,
            'PICKUP',
        );
        const business = await Business.query(transaction).findById(store.businessId);

        const storeSettings = await store.getStoreSettings();
        let pickupTime = toDateWithTimezone(new Date(), storeSettings.timeZone);
        pickupTime = pickupTime.set('hour', 9).utc();
        const params = {
            pickup_address: pickupAddress,
            dropoff_address: dropoffAddress,
            order_value: 3000,
            external_business_name: business.name,
            pickup_time: pickupTime.format(),
        };

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
        };

        const url = `${process.env.DOORDASH_API_URL}estimates`;
        const response = await axios.post(url, params, {
            headers,
        });

        const data = await response.data;

        newPayload.doorDashEstimate = data;
        return newPayload;
    } catch (error) {
        LoggerHandler('error', error.message, payload);
        return newPayload;
    }
}

module.exports = exports = generateDoorDashPickupEstimate;
