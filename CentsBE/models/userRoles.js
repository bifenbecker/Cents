const Model = require('./index');

class UserRole extends Model {
    static get tableName() {
        return 'userRoles';
    }

    static get idColumn() {
        return 'id';
    }
}

module.exports = UserRole;
