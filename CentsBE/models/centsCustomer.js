const { model } = require('lightrail-client');
const Model = require('./index');

class CentsCustomer extends Model {
    static get tableName() {
        return 'centsCustomers';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeInsert() {
        if (!this.languageId) {
            this.languageId = 1;
        }
    }

    $beforeUpdate() {
        if (!this.languageId) {
            this.languageId = 1;
        }
    }

    static get relationMappings() {
        const Language = require('./language');
        const StoreCustomer = require('./storeCustomer');
        const CentsCustomerAddress = require('./centsCustomerAddress');
        const PaymentMethod = require('./paymentMethod');
        const CreditHistory = require('./creditHistory');
        const BusinessCustomer = require('./businessCustomer');
        const CustomerPreferences = require('./customerPreferences.js');

        return {
            businessCustomers:{
                relation: Model.HasManyRelation,
                modelClass: BusinessCustomer,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${BusinessCustomer.tableName}.centsCustomerId`,
                },
            },

            language: {
                relation: Model.BelongsToOneRelation,
                modelClass: Language,
                join: {
                    from: `${this.tableName}.languageId`,
                    to: `${Language.tableName}.id`,
                },
            },

            storeCustomers: {
                relation: Model.HasManyRelation,
                modelClass: StoreCustomer,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StoreCustomer.tableName}.centsCustomerId`,
                },
            },

            addresses: {
                relation: Model.HasManyRelation,
                modelClass: CentsCustomerAddress,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${CentsCustomerAddress.tableName}.centsCustomerId`,
                },
            },

            paymentMethods: {
                relation: Model.HasManyRelation,
                modelClass: PaymentMethod,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${PaymentMethod.tableName}.centsCustomerId`,
                },
            },

            creditHistory: {
                relation: Model.HasManyRelation,
                modelClass: CreditHistory,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${CreditHistory.tableName}.centsCustomerId`,
                },
            },

            preferences: {
                relation: Model.HasManyRelation,
                modelClass: CustomerPreferences,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${CustomerPreferences.tableName}.customerId`
                }
            }
        };
    }

    getLanguage() {
        return this.$relatedQuery('language');
    }

    getStoreCustomers() {
        return this.$relatedQuery('storeCustomers');
    }

    getAddresses() {
        return this.$relatedQuery('addresses');
    }

    getPaymentMethods() {
        return this.$relatedQuery('paymentMethods');
    }

    fullName() {
        return (this.firstName + ' ' + this.lastName).trim();
      }
}

module.exports = CentsCustomer;
