const Model = require('./index');

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeInsert() {
        if (!this.languageId) {
            this.languageId = 1;
        }
    }

    $beforeUpdate() {
        if (!this.languageId) {
            this.languageId = 1;
        }
    }

    static get relationMappings() {
        const LaundromatBusiness = require('./laundromatBusiness');
        const TeamMember = require('./teamMember');
        const SecondaryDetails = require('./secondaryDetails');
        const ServiceOrder = require('./serviceOrders');
        const Role = require('./role');
        const UserRole = require('./userRoles');
        const Language = require('./language');

        return {
            business: {
                relation: Model.HasOneRelation,
                modelClass: LaundromatBusiness,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${LaundromatBusiness.tableName}.userId`,
                },
            },

            teamMember: {
                relation: Model.HasOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${TeamMember.tableName}.userId`,
                },
            },

            secondaryDetails: {
                relation: Model.HasManyRelation,
                modelClass: SecondaryDetails,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${SecondaryDetails.tableName}.userId`,
                },
            },

            orders: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrder.tableName}.userId`,
                },
            },

            roles: {
                relation: Model.ManyToManyRelation,
                modelClass: Role,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${UserRole.tableName}.userId`,
                        to: `${UserRole.tableName}.roleId`,
                    },
                    to: `${Role.tableName}.id`,
                },
            },

            language: {
                relation: Model.BelongsToOneRelation,
                modelClass: Language,
                join: {
                    from: `${this.tableName}.languageId`,
                    to: `${Language.tableName}.id`,
                },
            },
        };
    }

    getBusiness() {
        return this.$relatedQuery('business');
    }

    getRoles() {
        return this.$relatedQuery('roles');
    }

    getTeamMemberDetails() {
        return this.$relatedQuery('teamMember');
    }

    getLanguage() {
        return this.$relatedQuery('language');
    }
}

module.exports = User;
