const { raw } = require('objection');
const Model = require('./index');

class CreditHistory extends Model {
    static get tableName() {
        return 'creditHistory';
    }

    static get idColumn() {
        return 'id';
    }

    async $afterInsert(queryContext) {
        const StoreCustomer = require('./storeCustomer');
        await StoreCustomer.query(queryContext.transaction)
            .patch({
                creditAmount: raw(`(select round(sum(amount)::numeric, 2) from "creditHistory" where
             "businessId" = ${this.businessId} and "customerId" = ${this.customerId})`),
            })
            .where({
                centsCustomerId: this.customerId,
                businessId: this.businessId,
            });
    }
    static get relationMappings() {
        const CreditReason = require('./creditReasons');
        const CentsCustomer = require('./centsCustomer');
        const LaundromatBusiness = require('./laundromatBusiness');
        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: LaundromatBusiness,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${LaundromatBusiness.tableName}.id`,
                },
            },
            centsCustomer: {
                relation: Model.BelongsToOneRelation,
                modelClass: CentsCustomer,
                join: {
                    from: `${this.tableName}.customerId`,
                    to: `${CentsCustomer.tableName}.id`,
                },
            },
            creditReason: {
                relation: Model.BelongsToOneRelation,
                modelClass: CreditReason,
                join: {
                    from: `${this.tableName}.reasonId`,
                    to: `${CreditReason.tableName}.id`,
                },
            },
        };
    }

    /**
     * Create CreditHistory entity on pay via customer's credit amount
     *
     * @param {{centsCustomerId: number, businessId: number, creditAmount: number }} payload
     * @param {TransactionOrKnex | undefined} transaction
     * @returns {CreditHistory | undefined}
     */
    static async withdrawCredits(payload, transaction) {
        const {
            creditAmount,
            businessId,
            centsCustomerId
        } = payload;
        let creditHistory = undefined;
        const availableCredit = await CreditHistory.query(transaction)
            .sum('amount')
            .where('customerId', centsCustomerId)
            .andWhere('businessId', businessId)
            .first();
        if (availableCredit && availableCredit.sum >= creditAmount) {
            creditHistory = await CreditHistory.query(transaction)
                .insert({
                    businessId,
                    customerId: centsCustomerId,
                    reasonId: 1,
                    amount: `${-creditAmount}`,
                });
            return creditHistory;
        }

        return creditHistory;
    }

    getCentsCustomer() {
        return this.$relatedQuery('centsCustomer');
    }

    getBusiness() {
        return this.$relatedQuery('business');
    }
    getCreditReason() {
        return this.$relatedQuery('creditReason');
    }
}

module.exports = CreditHistory;
