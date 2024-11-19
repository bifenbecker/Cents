const Model = require('./index');
const serviceReferenceItem = require('./serviceReferenceItem');

class ServiceReferenceItemModifier extends Model {
    static get tableName() {
        return 'serviceReferenceItemModifiers';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        const ServiceReferenceItem = require('./serviceReferenceItem');
        return {
            serviceReferenceItem: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceReferenceItem,
                join: {
                    from: `${this.tableName}.serviceReferenceItemId`,
                    to: `${ServiceReferenceItem.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = ServiceReferenceItemModifier;
