const Model = require('./index');

class TeamMember extends Model {
    static get tableName() {
        return 'teamMembers';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const User = require('./user');
        const Stores = require('./store');
        const TeamMemberStores = require('./teamMemberStore');
        const Business = require('./laundromatBusiness');
        const activityLog = require('./orderActivityLog');
        const Route = require('./route');
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${this.tableName}.userId`,
                    to: `${User.tableName}.id`,
                },
            },

            stores: {
                relation: Model.ManyToManyRelation,
                modelClass: Stores,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${TeamMemberStores.tableName}.teamMemberId`,
                        to: `${TeamMemberStores.tableName}.storeId`,
                    },
                    to: `${Stores.tableName}.id`,
                },
            },
            activityLog: {
                relation: Model.HasManyRelation,
                modelClass: activityLog,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${activityLog.tableName}.teamMemberId`,
                },
            },
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`,
                },
            },
            routes: {
                relation: Model.HasManyRelation,
                modelClass: Route,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Route.tableName}.driverId`,
                },
            },
        };
    }

    getBusiness() {
        return this.$relatedQuery('business');
    }

    getUser() {
        return this.$relatedQuery('user');
    }
}

module.exports = TeamMember;
