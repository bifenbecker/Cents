const Model = require('./index');

class WeightLog extends Model {
    static get tableName() {
        return 'itemWeights';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const OrderItem = require('./serviceOrderItem');
        const TeamMember = require('./teamMember');
        // const Order = require('./orders');

        return {
            orderItem: {
                relation: Model.BelongsToOneRelation,
                modelClass: OrderItem,
                join: {
                    from: `${this.tableName}.orderItemId`,
                    to: `${OrderItem.tableName}.id`,
                },
            },
            teamMember: {
                relation: Model.HasOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.teamMemberId`,
                    to: `${TeamMember.tableName}.id`,
                },
            },
        };
    }

    getOrderItem() {
        return this.$relatedQuery('orderItem');
    }

    getTeamMember() {
        return this.$relatedQuery('teamMember');
    }
}

module.exports = WeightLog;
