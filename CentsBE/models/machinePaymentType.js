const Model = require('./index');

class MachinePaymentType extends Model {
    static get tableName() {
        return 'machinePaymentType';
    }

    static get idColumn() {
        return 'id';
    }
}

module.exports = MachinePaymentType;
