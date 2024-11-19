function mapResponse(input) {
    const response = {};
    response.id = input.id;
    response.fullName = input.secondaryDetails.fullName
        ? input.secondaryDetails.fullName
        : input.fullName;
    response.phoneNumber = input.secondaryDetails.phoneNumber
        ? input.secondaryDetails.phoneNumber
        : input.phoneNumber;
    response.email = input.secondaryDetails.email ? input.secondaryDetails.email : input.email;
    response.languageId = input.secondaryDetails.languageId
        ? input.secondaryDetails.languageId
        : input.languageId;
    return response;
}
function mapResponseWebApp(input) {
    const response = {};
    response.id = input.id;
    response.fullName = input.boFullName ? input.boFullName : input.fullName;
    response.phoneNumber = input.boPhoneNumber ? input.boPhoneNumber : input.phoneNumber;
    response.email = input.boEmail ? input.boEmail : input.email;
    response.languageId = input.languageId;
    return response;
}
module.exports = exports = { mapResponse, mapResponseWebApp };
