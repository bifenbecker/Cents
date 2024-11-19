const OrderNotificationLog = require('../../../models/orderNotificationLog');

const notify = require('../../../utils/sms/residentialOrderLiveLink');
const Store = require('../../../models/store');

/**
 * send sms notification if sms is enabled
 *
 * @param {*} payload
 * @return {*}
 */
async function notifyCustomer(payload) {
    try {
        const newPayload = payload;
        const { customer, serviceOrder, transaction } = payload;
        const residenceStore = await Store.query(transaction).findOne({
            id: serviceOrder.storeId,
        });
        const residenceSettings = await residenceStore.getStoreSettings();
        if (residenceSettings.hasSmsEnabled) {
            const storeName = residenceStore.name;
            const sms = await notify(customer, serviceOrder, storeName);
            if (!sms.error) {
                await OrderNotificationLog.query(transaction).insert({
                    orderId: serviceOrder.id,
                    status: serviceOrder.status,
                    phoneNumber: customer.phoneNumber,
                    notifiedAt: sms.dateCreated.toISOString(),
                    languageId: 1,
                });
            }
        }
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = notifyCustomer;
