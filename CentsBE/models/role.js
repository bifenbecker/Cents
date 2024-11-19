const Model = require('./index');
const { userRoles } = require('../constants/constants');

class Role extends Model {
    static get tableName() {
        return 'roles';
    }

    static get idColumn() {
        return 'id';
    }

    roleName() {
        return userRoles[this.userType];
    }

    static get relationMappings() {
        const User = require('./user');
        const UserRole = require('./userRoles');

        return {
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${UserRole.tableName}.roleId`,
                        to: `${UserRole.tableName}.userId`,
                    },
                    to: `${User.tableName}.id`,
                },
            },
        };
    }

    get users() {
        this.$relatedQuery('users');
    }
}

module.exports = Role;
