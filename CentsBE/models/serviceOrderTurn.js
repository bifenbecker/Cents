const Model = require('./index');

class ServiceOrderTurn extends Model {
    static get tableName() {
        return 'serviceOrderTurns';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Turn = require('./turns');
        const ServiceOrder = require('./serviceOrders');

        return {
            turn: {
                relation: Model.BelongsToOneRelation,
                modelClass: Turn,
                join: {
                    from: `${this.tableName}.turnId`,
                    to: `${Turn.tableName}.id`,
                },
            },
            serviceOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.serviceOrderId`,
                    to: `${ServiceOrder.tableName}.id`,
                },
            },
        };
    }
}

module.exports = ServiceOrderTurn;
