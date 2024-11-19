const Model = require('./index');

class CreditReason extends Model {
    static get tableName() {
        return 'creditReasons';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {}
}

module.exports = CreditReason;
