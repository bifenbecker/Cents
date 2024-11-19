const Model = require('./index');

class StorageRack extends Model {
    static get tableName() {
        return 'storageRacks';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const ServiceOrders = require('./serviceOrders');

        return {
            serviceOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrders,
                join: {
                    from: `${this.tableName}.serviceOrderId`,
                    to: `${ServiceOrders.tableName}.id`,
                },
            },
        };
    }
}

module.exports = StorageRack;
