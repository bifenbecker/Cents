const jwt = require('jsonwebtoken');

function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_TOKEN);
}

function decodeToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET_TOKEN);
}

function generateLiveLinkCustomerToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_LIVE_LINK_CUSTOMER);
}

function decodeLiveLinkCustomerToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET_LIVE_LINK_CUSTOMER);
}

function generateLiveLinkOrderToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_TOKEN_ORDER);
}

function decodeLiveLinkOrderToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET_TOKEN_ORDER);
}

const classicVersion = '1.4.6';
const dryCleaningVersion = '2.0.0';

module.exports = {
    generateToken,
    decodeToken,
    generateLiveLinkCustomerToken,
    decodeLiveLinkCustomerToken,
    generateLiveLinkOrderToken,
    decodeLiveLinkOrderToken,
    classicVersion,
    dryCleaningVersion,
};
