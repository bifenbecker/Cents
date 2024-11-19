const Model = require('./index');

class Language extends Model {
    static get tableName() {
        return 'languages';
    }
}

module.exports = exports = Language;
