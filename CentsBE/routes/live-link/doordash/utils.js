/**
 * Format the pickup and dropoff addresses based on delivery type
 *
 * @param {Object} store
 * @param {Object} customerAddress
 * @param {String} type
 */
function setPickupAndDropoffAddresses(store, customerAddress, type) {
    let pickupAddress = null;
    let dropoffAddress = null;

    if (type === 'RETURN') {
        pickupAddress = {
            city: store.city,
            state: store.state,
            street: store.address,
            unit: null,
            zip_code: store.zipCode,
        };
        dropoffAddress = {
            city: customerAddress.city,
            state: customerAddress.firstLevelSubdivisionCode,
            street: customerAddress.address1,
            unit: customerAddress.address2,
            zip_code: customerAddress.postalCode,
        };
    } else {
        dropoffAddress = {
            city: store.city,
            state: store.state,
            street: store.address,
            unit: null,
            zip_code: store.zipCode,
        };
        pickupAddress = {
            city: customerAddress.city,
            state: customerAddress.firstLevelSubdivisionCode,
            street: customerAddress.address1,
            unit: customerAddress.address2,
            zip_code: customerAddress.postalCode,
        };
    }

    return [pickupAddress, dropoffAddress];
}

module.exports = exports = {
    setPickupAndDropoffAddresses,
};
