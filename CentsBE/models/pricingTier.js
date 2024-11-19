const Model = require('./index');

class PricingTier extends Model {
    static get idColumn() {
        return 'id';
    }

    static get tableName() {
        return 'pricingTiers';
    }

    static get relationMappings() {
        const laundromatBusiness = require('./laundromatBusiness');
        const BusinessCustomer = require('./businessCustomer');
        const ServiceOrder = require('./serviceOrders');
        const ServicePrice = require('./servicePrices');
        const InventorItem = require('./inventoryItem');
        const Zone = require('./zone')
        const StoreSettings = require('./storeSettings');
        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: laundromatBusiness,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${laundromatBusiness.tableName}.id`,
                },
            },
            businessCustomers: {
                relation: Model.HasManyRelation,
                modelClass: BusinessCustomer,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${BusinessCustomer.tableName}.commercialTierId`,
                },
            },
            serviceOrders: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrder.tableName}.tierId`,
                },
            },
            zones: {
                relation: Model.HasManyRelation,
                modelClass: Zone,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Zone.tableName}.deliveryTierId`,
                },
            },
            servicePrices: {
                relation: Model.HasManyRelation,
                modelClass: ServicePrice,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServicePrice.tableName}.pricingTierId`,
                },
            },
            inventoryItems: {
                relation: Model.HasManyRelation,
                modelClass: InventorItem,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${InventorItem.tableName}.pricingTierId`,
                },
            },
            storeSettings: {
                relation: Model.HasManyRelation,
                modelClass: StoreSettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StoreSettings.tableName}.deliveryTierId`,
                },
            }
        }
        
    }
}

module.exports = PricingTier;