const Joi = require('@hapi/joi');
const OTPService = require('../../services/sms/otp-service');
const Store = require('../../models/store');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        phoneNumber: Joi.string().required(),
        subsidiaryCode: Joi.number().optional().allow(null, ''),
        storeId: Joi.number().required(),
    });

    const isValid = Joi.validate(inputObj, schema);
    return isValid;
}

async function requestOtp(req, res, next) {
    try {
        const { phoneNumber, subsidiaryCode, storeId } = req.body;

        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const store = await Store.query().withGraphFetched('settings').findById(storeId);
        const { hasSmsEnabled } = store.settings;

        const OtpService = new OTPService(phoneNumber, hasSmsEnabled, subsidiaryCode);
        await OtpService.sendOTP();
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = requestOtp;
