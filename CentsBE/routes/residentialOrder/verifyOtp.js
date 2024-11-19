const OTPService = require('../../services/sms/otp-service');
const StoreCustomer = require('../../models/storeCustomer');
const CustomerService = require('../../services/residential/Customer');

async function verifyOtp(req, res, next) {
    try {
        const { phoneNumber, otp } = req.body;
        const storeId = req.currentStore.id;
        const OtpService = new OTPService(phoneNumber);
        const verified = await OtpService.verifyOTP(otp);

        const customer = await StoreCustomer.query()
            .findOne({
                storeId,
                phoneNumber,
            })
            .withGraphFetched('centsCustomer');

        if (verified && customer) {
            const customerService = new CustomerService(customer);
            const pendingOrders = await customerService.hasPendingOrders();
            const customerAuthToken = customerService.generateToken();

            res.status(200).json({
                pendingOrders,
                verified: true,
                customerAuthToken,
                customer: customerService.details,
            });
            return;
        }

        res.status(200).json({
            verified,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { verifyOtp };
