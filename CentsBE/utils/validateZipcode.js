const zipcodes = require('zipcodes');
const { validateUniqueBusinessZipCodes } = require('../elasticsearch/store/queries');

async function validateZipCode(zipCodes, business, storeId) {
    let zipCodeExists;
    for (const zipCode of zipCodes) {
        zipCodeExists = zipcodes.lookup(zipCode);
        if (!zipCodeExists) {
            throw new Error('invalid_zipcode');
        }
    }

    const hasUniqueZipCodes = await validateUniqueBusinessZipCodes({
        zipCodes,
        storeId,
        businessId: business.id,
    });

    if (!hasUniqueZipCodes) {
        throw new Error('zipcode_exists');
    }
}

module.exports = validateZipCode;
