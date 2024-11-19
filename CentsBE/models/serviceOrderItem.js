const Model = require('./index');

class OrderItem extends Model {
    static get tableName() {
        return 'serviceOrderItems';
    }

    $beforeUpdate() {
        if (this.deletedAt) {
            this.deletedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        const ServiceReferenceItem = require('./serviceReferenceItem');
        const ServiceOrder = require('./serviceOrders');

        return {
            allReferenceItems: {
                relation: Model.HasManyRelation,
                modelClass: ServiceReferenceItem,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceReferenceItem.tableName}.orderItemId`,
                },
            },

            referenceItems: {
                relation: Model.HasManyRelation,
                modelClass: ServiceReferenceItem,
                filter(builder) {
                    builder.where('deletedAt', null);
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceReferenceItem.tableName}.orderItemId`,
                },
            },

            serviceOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.orderId`,
                    to: `${ServiceOrder.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = OrderItem;
