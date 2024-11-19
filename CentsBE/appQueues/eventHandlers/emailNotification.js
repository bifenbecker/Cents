const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const { emailNotificationEvents } = require('../../constants/constants');
const businessMail = require('../../services/email/businessAdminMail');
const managerMail = require('../../services/email/managerAdminMail');
const forgotPasswordEmail = require('../../services/email/forgotPassword');
const resetPasswordEmail = require('../../services/email/resetPasswordMail');
const sendWelcomeEmail = require('../../uow/subscription/sendWelcomeEmailUow');
const sendEmailToBusinessOwner = require('../../uow/subscription/sendEmailToBusinessOwnerUow');
const sendOrderDeliveryEmail = require('../../uow/delivery/pickup/sendOrderDelayedEmailUow');

module.exports = async (job, done) => {
    try {
        const { data } = job;
        switch (data.eventName) {
            case emailNotificationEvents.ADMIN_ACCESS_PASSWORD_RESET:
                await businessMail(data.updatedUser, data.currentUser);
                break;
            case emailNotificationEvents.MANAGER_ACCESS_PASSWORD_RESET:
                await managerMail(data.updatedUser, data.currentUser);
                break;
            case emailNotificationEvents.FORGOT_PASSWORD:
                await forgotPasswordEmail(data.user);
                break;
            case emailNotificationEvents.RESET_PASSWORD:
                await resetPasswordEmail(data.user);
                break;
            case emailNotificationEvents.VERIFY_ACCOUNT:
                await sendWelcomeEmail(data);
                break;
            case emailNotificationEvents.CENTS_QUOTE:
                await sendEmailToBusinessOwner(data);
                break;
            case emailNotificationEvents.INTENT_ORDER_PICKUP_NOTIFICATION:
                await sendOrderDeliveryEmail(data);
                break;
            default:
                break;
        }
        done();
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error occurred in sms trigger.',
            job,
        });
        done(error);
    }
};
