const Model = require('./index');

class TeamMemberStores extends Model {
    static get tableName() {
        return 'teamMemberStores';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Store = require('./store');
        const TeamMember = require('./teamMember');

        return {
            teamMember: {
                relation: Model.HasOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.teamMemberId`,
                    to: `${TeamMember.tableName}.id`,
                },
            },

            store: {
                relation: Model.HasOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
        };
    }
}

module.exports = TeamMemberStores;
