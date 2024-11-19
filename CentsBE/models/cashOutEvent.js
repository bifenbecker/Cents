const Model = require('./index');

class CashOutEvent extends Model {
    static get tableName() {
        return 'cashOutEvents';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        const Store = require('./store');
        const TeamMember = require('./');

        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
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
}

module.exports = exports = CashOutEvent;
