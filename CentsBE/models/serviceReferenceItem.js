const Model = require('./index');
const serviceReferenceItemModifiers = require('./serviceReferenceItemModifiers');

class ServiceReferenceItem extends Model {
    static get tableName() {
        return 'serviceReferenceItems';
    }

    static get relationMappings() {
        const ServicePrice = require('./servicePrices');
        const Service = require('./services');
        const InventoryItem = require('./inventoryItem');
        const ServiceOrderBags = require('./serviceOrderBags');
        const ServiceReferenceItemDetail = require('./serviceReferenceItemDetail');
        const OrderItem = require('./serviceOrderItem');
        const ServiceOrderWeights = require('./serviceOrderWeights');
        const ServiceReferenceItemModifier = require('./serviceReferenceItemModifiers');

        return {
            servicePrice: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServicePrice,
                join: {
                    from: `${this.tableName}.servicePriceId`,
                    to: `${ServicePrice.tableName}.id`,
                },
            },

            service$: {
                relation: Model.BelongsToOneRelation,
                modelClass: Service,
                join: {
                    from: `${this.tableName}.serviceId`,
                    to: `${Service.tableName}.id`,
                },
            },

            inventoryItem: {
                relation: Model.BelongsToOneRelation,
                modelClass: InventoryItem,
                join: {
                    from: `${this.tableName}.inventoryItemId`,
                    to: `${InventoryItem.tableName}.id`,
                },
            },

            weightLog: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrderWeights,
                filter(builder) {
                    builder.where('deletedAt', null);
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderWeights.tableName}.referenceItemId`,
                },
            },

            serviceOrderBags: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrderBags,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderBags.tableName}.referenceItemId`,
                },
            },

            allLineItemDetail: {
                relation: Model.HasOneRelation,
                modelClass: ServiceReferenceItemDetail,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceReferenceItemDetail.tableName}.serviceReferenceItemId`,
                },
            },

            lineItemDetail: {
                relation: Model.HasOneRelation,
                modelClass: ServiceReferenceItemDetail,
                filter(builder) {
                    builder.where('deletedAt', null);
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceReferenceItemDetail.tableName}.serviceReferenceItemId`,
                },
            },

            orderItem: {
                relation: Model.BelongsToOneRelation,
                modelClass: OrderItem,
                join: {
                    from: `${this.tableName}.orderItemId`,
                    to: `${OrderItem.tableName}.id`,
                },
            },

            modifiers: {
                relation: Model.HasManyRelation,
                modelClass: ServiceReferenceItemModifier,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${serviceReferenceItemModifiers.tableName}.serviceReferenceItemId`,
                },
            },
        };
    }

    getLineItem() {
        return this.$relatedQuery('lineItemDetail');
    }
}

module.exports = exports = ServiceReferenceItem;
