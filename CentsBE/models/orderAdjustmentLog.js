const Model = require('./index');
class OrderAdjustmentLog extends Model {
    static get tableName() {
        return 'orderAdjustmentLog';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const ServiceOrder = require('./serviceOrders');
        const TeamMember = require('./teamMember');
        return {
            order: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.serviceOrderId`,
                    to: `${ServiceOrder.tableName}.id`,
                },
            },
            employee: {
                relation: Model.BelongsToOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.teamMemberId`,
                    to: `${TeamMember.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = OrderAdjustmentLog;
