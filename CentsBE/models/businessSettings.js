const Model = require('./index');

class BusinessSettings extends Model {
    static get tableName() {
        return 'businessSettings';
    }
}

module.exports = BusinessSettings;
