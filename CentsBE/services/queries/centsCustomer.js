const { raw } = require('objection');
const BusinessCustomer = require('../../models/businessCustomer');
const CreditHistory = require('../../models/creditHistory');
const StoreCustomer = require('../../models/storeCustomer');

class CentsCustomerQuery {
    constructor(centsCustomerId, transaction = null) {
        this.centsCustomerId = centsCustomerId;
        this.transaction = transaction;
    }

    getStoreCustomers() {
        return StoreCustomer.query(this.transaction).where('centsCustomerId', this.centsCustomerId);
    }

    getBusinessCustomer(businessId) {
        return BusinessCustomer.query(this.transaction).findOne({
            centsCustomerId: this.centsCustomerId,
            businessId,
        });
    }

    async calculateCustomerCreditAmount(businessId) {
        const customerCredits = await CreditHistory.query(this.transaction)
            .select(raw('sum(amount) as credits'))
            .where({
                customerId: this.centsCustomerId,
                businessId,
            })
            .first();
        return customerCredits.credits;
    }

    async createOrUpdateBusinessCustomer(storeCustomer) {
        this.businessId = storeCustomer.businessId;
        const customerCreditAmount = await this.calculateCustomerCreditAmount(this.businessId);
        const existingBusinessCustomer = await this.getBusinessCustomer(this.businessId);
        if (existingBusinessCustomer) {
            await existingBusinessCustomer.$query(this.transaction).update({
                creditAmount: customerCreditAmount || 0,
            });
            this.businessCustomerId = existingBusinessCustomer.id;
        } else {
            const businessCustomerPayload = {
                businessId: this.businessId,
                centsCustomerId: this.centsCustomerId,
                creditAmount: customerCreditAmount || 0,
            };
            const businessCustomer = await BusinessCustomer.query(this.transaction).insert(
                businessCustomerPayload,
            );
            this.businessCustomerId = businessCustomer.id;
        }
        await this.updateStoreCustomer(storeCustomer.id);
    }

    updateStoreCustomer(storeCustomerId) {
        return StoreCustomer.query(this.transaction)
            .patch({
                businessCustomerId: this.businessCustomerId,
            })
            .where('id', storeCustomerId)
            .context({
                afterUpdateHookCancel: true,
            });
    }
}

module.exports = exports = CentsCustomerQuery;
