const OTP_EXPIRATION_TIME = 360; // 1 hr
const smsOTP = require('./send-otp');
const redis = require('../../redis-server');
const generateOTP = require('../../utils/generateRandNumber');
const sendOTPEmail = require('../email/email-otp');

class OTPService {
    constructor(phoneNumber, hasSmsEnabled = true, subsidiaryCode = null, isAuthorized = false) {
        this.phone = phoneNumber;
        this.hasSmsEnabled = hasSmsEnabled;
        this.subsidiaryCode = subsidiaryCode;
        this.isAuthorized = isAuthorized;
    }

    async persistToRedis(otp) {
        redis.setex(this.phone, OTP_EXPIRATION_TIME, otp);
    }

    async sendOTP(messageType = 'kin') {
        let otp;
        if (this.subsidiaryCode) {
            otp = this.subsidiaryCode;
        } else if (process.env.NODE_ENV === 'development') {
            otp = '111111';
        } else {
            otp = generateOTP();
        }

        if (this.hasSmsEnabled) {
            await smsOTP(this.phone, otp, messageType, this.isAuthorized);
            await this.emailOtp(otp);
        }

        await this.persistToRedis(otp);
        return otp;
    }

    async verifyOTP(otp) {
        const result = await redis.get(this.phone);
        return otp === result;
    }

    async emailOtp(otp) {
        if (process.env.QA_EMAIL) {
            await sendOTPEmail(this.phone, otp);
        }
    }
}

module.exports = OTPService;
