const Language = require('../../models/language');
// const SecondaryDetails = require('../../models/secondaryDetails');

async function getDetails(storeCustomer) {
    try {
        // prioritize Business level details over cents level details.
        /*    const secondaryDetails = await SecondaryDetails.query().findOne({
            userId: user.id,
            businessId: store.businessId,
        }); */
        let languageId = 0;
        const { phoneNumber } = storeCustomer;
        const fullName = `${storeCustomer.firstName} ${storeCustomer.lastName}`;
        if (storeCustomer.languageId) {
            languageId = storeCustomer.languageId;
        }
        /* if (secondaryDetails) {
            languageId = secondaryDetails.languageId ? secondaryDetails.languageId
                : user.languageId;
            phoneNumber = secondaryDetails.phoneNumber ? secondaryDetails.phoneNumber
                : user.phone;
            fullName = secondaryDetails.fullName ? secondaryDetails.fullName
                : `${user.firstname} ${user.lastname}`;
        } */
        let language = '';
        if (languageId) {
            language = await Language.query().findById(languageId);
        } else {
            // if there is no language associated with the user.
            // By default the language should be english.
            language = await Language.query().findOne({ language: 'english' });
            languageId = language.id;
        }
        return {
            fullName,
            phone: phoneNumber,
            language: language.language,
            languageId,
        };
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getDetails;
