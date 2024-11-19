const Model = require('./index.js');

class DetergentType extends Model {
    static get tableName() {
        return 'detergentTypes';
    }
}

module.exports = exports = DetergentType;
