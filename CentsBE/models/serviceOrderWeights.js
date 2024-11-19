const Model = require('./index');

class ServiceOrderWeights extends Model {
    static get tableName() {
        return 'serviceOrderWeights';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Orders = require('./serviceOrders');
        const TeamMember = require('./teamMember');
        const ServiceReferenceItems = require('./serviceReferenceItem');

        return {
            order: {
                relation: Model.BelongsToOneRelation,
                modelClass: Orders,
                join: {
                    from: `${this.tableName}.serviceOrderId`,
                    to: `${Orders.tableName}.id`,
                },
            },
            teamMember: {
                relation: Model.BelongsToOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.teamMemberId`,
                    to: `${TeamMember.tableName}.id`,
                },
            },
            editedByTeamMember: {
                relation: Model.BelongsToOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.editedBy`,
                    to: `${TeamMember.tableName}.id`,
                },
            },
            serviceReferenceItem: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceReferenceItems,
                join: {
                    from: `${this.tableName}.referenceItemId`,
                    to: `${ServiceReferenceItems.tableName}.id`,
                },
            },
            adjustedByEmployee: {
                relation: Model.BelongsToOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.adjustedBy`,
                    to: `${TeamMember.tableName}.id`,
                },
            },
        };
    }

    getOrders() {
        return this.$relatedQuery('order');
    }

    getTeamMember() {
        return this.$relatedQuery('teamMember');
    }
}

module.exports = ServiceOrderWeights;
