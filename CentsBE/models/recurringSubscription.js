const Model = require('./index');

class RecurringSubscription extends Model {
    static get tableName() {
        return 'recurringSubscriptions';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        const Store = require('./store');
        const CentsCustomer = require('./centsCustomer');
        const CentsCustomerAddress = require('./centsCustomerAddress');
        const Timings = require('./timings');
        const ServicePrices = require('./servicePrices');

        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },

            customer: {
                relation: Model.BelongsToOneRelation,
                modelClass: CentsCustomer,
                join: {
                    from: `${this.tableName}.centsCustomerId`,
                    to: `${CentsCustomer.tableName}.id`,
                },
            },

            address: {
                relation: Model.HasOneRelation,
                modelClass: CentsCustomerAddress,
                join: {
                    from: `${this.tableName}.centsCustomerAddressId`,
                    to: `${CentsCustomerAddress.tableName}.id`,
                },
            },

            pickup: {
                relation: Model.HasOneRelation,
                modelClass: Timings,
                join: {
                    from: `${this.tableName}.pickupTimingsId`,
                    to: `${Timings.tableName}.id`,
                },
            },

            return: {
                relation: Model.HasOneRelation,
                modelClass: Timings,
                join: {
                    from: `${this.tableName}.returnTimingsId`,
                    to: `${Timings.tableName}.id`,
                },
            },

            servicePrice: {
                relation: Model.HasOneRelation,
                modelClass: ServicePrices,
                join: {
                    from: `${this.tableName}.servicePriceId`,
                    to: `${ServicePrices.tableName}.id`,
                },
            },
        };
    }
}

module.exports = RecurringSubscription;
