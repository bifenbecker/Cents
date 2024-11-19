const { raw } = require('objection');
const Model = require('./index');

class StoreCustomer extends Model {
    static get tableName() {
        return 'storeCustomers';
    }

    static get idColumn() {
        return 'id';
    }

    async $beforeInsert(queryContext) {
        const CreditHistory = require('./creditHistory');
        const customerCredits = await CreditHistory.query(queryContext.transaction)
            .select(raw('sum(amount) as credits'))
            .where({
                customerId: this.centsCustomerId,
                businessId: this.businessId,
            })
            .first();
        this.creditAmount = customerCredits.credits;
        if (!this.languageId) {
            this.languageId = 1;
        }
        if (this.notes) {
            this.notes = this.notes.trim();
        }
    }

    $beforeUpdate() {
        if (!this.languageId) {
            this.languageId = 1;
        }
        if (this.notes) {
            this.notes = this.notes.trim();
        }
    }

    static async afterInsert(args) {
        // create business customer for the cents customer
        const { transaction, result } = args;
        const CentsCustomerQuery = require('../services/queries/centsCustomer');
        if (result.length > 0) {
            await Promise.all(
                result.map(async (storeCustomer) => {
                    const centsCustomerQuery = new CentsCustomerQuery(
                        storeCustomer.centsCustomerId,
                        transaction,
                    );
                    await centsCustomerQuery.createOrUpdateBusinessCustomer(storeCustomer);
                }),
            );
        }
    }

    static async afterUpdate(args) {
        const { transaction, asFindQuery, context } = args;
        if (context.afterUpdateHookCancel) {
            return;
        }
        const CentsCustomerQuery = require('../services/queries/centsCustomer');
        const storeCustomers = await asFindQuery(transaction).select();
        if (storeCustomers.length > 0) {
            await Promise.all(
                storeCustomers.map(async (storeCustomer) => {
                    const centsCustomerQuery = new CentsCustomerQuery(
                        storeCustomer.centsCustomerId,
                        transaction,
                    );
                    await centsCustomerQuery.createOrUpdateBusinessCustomer(storeCustomer);
                }),
            );
        }
    }

    static get relationMappings() {
        const CentsCustomer = require('./centsCustomer');
        const Store = require('./store');
        const laundromatBusiness = require('./laundromatBusiness');
        const OrderDelivery = require('./orderDelivery');
        const Turn = require('./turns');
        const BusinessCustomer = require('./businessCustomer');
        const ServiceOrder = require('./serviceOrders');
        const InventoryOrder = require('./inventoryOrders');
        return {
            centsCustomer: {
                relation: Model.BelongsToOneRelation,
                modelClass: CentsCustomer,
                join: {
                    from: `${this.tableName}.centsCustomerId`,
                    to: `${CentsCustomer.tableName}.id`,
                },
            },

            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },

            turns: {
                relation: Model.HasManyRelation,
                modelClass: Turn,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Turn.tableName}.storeCustomerId`,
                },
            },

            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: laundromatBusiness,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${laundromatBusiness.tableName}.id`,
                },
            },

            orderDeliveries: {
                relation: Model.HasManyRelation,
                modelClass: OrderDelivery,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OrderDelivery.tableName}.storeCustomerId`,
                },
            },

            businessCustomer: {
                relation: Model.BelongsToOneRelation,
                modelClass: BusinessCustomer,
                join: {
                    from: `${this.tableName}.businessCustomerId`,
                    to: `${BusinessCustomer.tableName}.id`,
                },
            },

            serviceOrders: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrder.tableName}.storeCustomerId`,
                },
            },

            inventoryOrders: {
                relation: Model.HasManyRelation,
                modelClass: InventoryOrder,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${InventoryOrder.tableName}.storeCustomerId`,
                },
            },
        };
    }

    getCentsCustomer() {
        return this.$relatedQuery('centsCustomer');
    }

    getStore() {
        return this.$relatedQuery('store');
    }

    getBusiness() {
        return this.$relatedQuery('business');
    }
}

module.exports = StoreCustomer;
