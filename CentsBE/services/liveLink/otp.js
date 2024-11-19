const OtpService = require('../sms/otp-service');
const TokenOperations = require('../tokenOperations/main');

const { findCustomer } = require('./queries/customer');
const { getCustomer, getLatestServiceOrder } = require('./queries/serviceOrder');

async function getLatestServiceOrderToken(centsCustomerId) {
    const order = await getLatestServiceOrder(centsCustomerId);
    if (order) {
        const jwtService = new TokenOperations({ id: order.id });
        return jwtService.tokenGenerator(process.env.JWT_SECRET_TOKEN_ORDER);
    }
    return '';
}

async function requestOtp(phoneNumber, enableSms, subsidiaryCode = null, isAuthorized = false) {
    const otpService = new OtpService(phoneNumber, enableSms, subsidiaryCode, isAuthorized);
    const otp = await otpService.sendOTP('liveLink', isAuthorized);
    // returning customer name if it exists.
    const customer = await findCustomer(phoneNumber);
    let firstName = '';
    let lastName = '';
    if (customer) {
        firstName = customer.firstName;
        lastName = customer.lastName;
    }
    return {
        firstName,
        lastName,
        phoneNumber,
        otp,
    };
}

async function verifyOtp(phoneNumber, otp) {
    const otpService = new OtpService(phoneNumber);
    const isOtpValid = await otpService.verifyOTP(otp);
    if (!isOtpValid) {
        throw new Error('INVALID_OTP');
    }
    const customer = await findCustomer(phoneNumber);
    if (customer) {
        const { centsCustomerId, firstName, lastName } = customer;
        const jwtService = new TokenOperations({ id: centsCustomerId });
        const latestOrderToken = await getLatestServiceOrderToken(centsCustomerId);
        return {
            isNew: false,
            customerAuthToken: jwtService.tokenGenerator(process.env.JWT_SECRET_LIVE_LINK_CUSTOMER),
            customer: {
                firstName,
                lastName,
            },
            latestOrderToken,
        };
    }
    return {
        isNew: true,
    };
}

async function getPhoneNumber(order) {
    const customer = await getCustomer(order.id);
    if (!customer) {
        throw new Error('ORDER_NOT_FOUND');
    }
    return customer.phoneNumber;
}

module.exports = exports = {
    requestOtp,
    verifyOtp,
    getPhoneNumber,
};
