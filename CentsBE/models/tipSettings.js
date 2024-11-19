const Model = require('./index');

class TipSetting extends Model {
    static get tableName() {
        return 'tipSettings';
    }
}

module.exports = TipSetting;
