const atob = require('atob');
const btoa = require('btoa');

const newTypeIdIncrement = 10000;

// There are cases when a string passed as customUrl can be interpreted as a real ID.
// In such cases, the backend refuses to save with an error stating that this character
// combination is reserved. To avoid such cases, maxDecodedId is necessary.
const maxDecodedId = 10000000;

const incrementalIdDecrypt = (encodedId) => {
    let decodedId;
    if (encodedId) {
        const possibleId = parseInt(atob(encodedId), 36) - newTypeIdIncrement;
        if (possibleId > 0 && possibleId < maxDecodedId) {
            decodedId = possibleId;
        }
    }
    return decodedId;
};

const incrementalIdEncrypt = (decodedId) => {
    const numerousDecodedId = Number(decodedId);
    if (numerousDecodedId) {
        return btoa((Number(decodedId) + newTypeIdIncrement).toString(36));
    }
    return null;
};

const getEncodedBusinessIdType = (encodedId) => {
    const decodedId = incrementalIdDecrypt(`${encodedId}`);
    const businessThemeData = {
        businessId: null,
        customThemeLink: null,
    };

    if (encodedId > 0 && !decodedId) {
        businessThemeData.businessId = encodedId;
    } else if (decodedId > 0 && decodedId < maxDecodedId) {
        businessThemeData.businessId = decodedId;
    } else {
        businessThemeData.customThemeLink = encodedId;
    }
    return businessThemeData;
};

module.exports = {
    incrementalIdDecrypt,
    incrementalIdEncrypt,
    getEncodedBusinessIdType,
};
