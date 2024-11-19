const Model = require('./index');

const ServicesMaster = require('./services');
const InventoryItem = require('./inventoryItem');
const ServicePrices = require('./servicePrices');
const ServiceReferenceItem = require('./serviceReferenceItem');
const ServiceReferenceItemDetailModifier = require('./serviceReferenceItemDetailModifier');

class ServiceReferenceItemDetail extends Model {
    static get tableName() {
        return 'serviceReferenceItemDetails';
    }

    retrieveProperModel() {
        return this.soldItemType === 'InventoryItem'
            ? InventoryItem
            : this.soldItemType === 'ServicesMaster'
            ? ServicesMaster
            : ServicePrices;
    }

    getSoldItemReference() {
        if (!this.soldItemType) return undefined;
        const SoldItemModel = this.retrieveProperModel();
        return SoldItemModel ? SoldItemModel.query().findById(this.soldItemId) : null;
    }

    $beforeUpdate() {
        if (this.deletedAt) {
            this.deletedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        return {
            serviceReferenceItem: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceReferenceItem,
                join: {
                    from: `${this.tableName}.serviceReferenceItemId`,
                    to: `${ServiceReferenceItem.tableName}.id`,
                },
            },

            serviceMaster: {
                relation: Model.HasOneRelation,
                modelClass: ServicesMaster,
                join: {
                    from: `${this.tableName}.soldItemId`,
                    to: `${ServicesMaster.tableName}.id`,
                },
            },

            inventoryItem: {
                relation: Model.HasOneRelation,
                modelClass: InventoryItem,
                join: {
                    from: `${this.tableName}.soldItemId`,
                    to: `${InventoryItem.tableName}.id`,
                },
            },

            servicePrice: {
                relation: Model.HasOneRelation,
                modelClass: ServicePrices,
                join: {
                    from: `${this.tableName}.soldItemId`,
                    to: `${ServicePrices.tableName}.id`,
                },
            },
            
            modifierLineItems: {
                relation: Model.HasManyRelation,
                modelClass: ServiceReferenceItemDetailModifier,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceReferenceItemDetailModifier.tableName}.serviceReferenceItemDetailId`,
                },
            }
        };
    }

    getServiceReferenceItem() {
        return this.$relatedQuery('serviceReferenceItem');
    }
}

module.exports = exports = ServiceReferenceItemDetail;
