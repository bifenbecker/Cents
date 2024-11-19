async function getCustomer(user) {
    const addresses = await user.centsCustomer.getAddresses();
    // prioritize business level details over cents level details.
    const details = {};
    details.id = user.id;
    details.fullName = `${user.firstName} ${user.lastName}`;
    details.phoneNumber = user.phoneNumber ? user.phoneNumber : user.centsCustomer.phoneNumber;
    details.email = user.email ? user.email : user.centsCustomer.email;
    details.languageId = user.languageId ? user.languageId : user.centsCustomer.languageId || 1;
    details.storeCustomerId = user.id;
    details.centsCustomerId = user.centsCustomer.id;
    details.stripeCustomerId = user.centsCustomer.stripeCustomerId;
    details.availableCredit = Number((user.creditAmount || 0).toFixed(2));
    details.notes = user.notes || '';
    details.isHangDrySelected = user.isHangDrySelected || false;
    details.hangDryInstructions = user.hangDryInstructions;
    details.addresses = addresses;
    return details;
}

module.exports = exports = {
    getCustomer,
};
