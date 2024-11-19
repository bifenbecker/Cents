const ObjectionAdapter = require('factory-girl-objection-adapter');

class FindOrCreateAdapter extends ObjectionAdapter {
    constructor(field) {
        super();
        this.field = field;
    }
    async save(model, Model) {
        const existingRecord = await Model.query().findOne({ [this.field]: model[this.field] });
        if (existingRecord) {
            return existingRecord;
        }
        return super.save(model, Model);
    }
}
module.exports = exports = FindOrCreateAdapter;
