const { factory } = require('factory-girl');
const CustomerPrefOptions = require('../../models/customerPrefOptions');
const faker = require('faker');
require('./laundromatBusinesses')

function parsePreferenceOptions(model) {
    try {
        model.options = JSON.parse(model.options);
        return model;
    } catch (e) {
        throw e;
    }
}

factory.define('customerPrefOptions', CustomerPrefOptions, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    type: faker.random.arrayElement(["multi", "single"]),
    options: JSON.stringify([
        {
            "value": "cold",
            "isDefault": false
        },
        {
            "value": "warm",
            "isDefault": true
        },
        {
            "value": "hot",
            "isDefault": false
        }
    ]),
    fieldName: factory.chance('word'),
}, {
    afterCreate: parsePreferenceOptions,
    afterBuild: (model, {}, {applyOnCreateOnly}) => {
        if (!applyOnCreateOnly){
            try {
                return parsePreferenceOptions(model)
            } catch (e) {
                throw e;
            }
        } else {
            return model;
        }
    }
});

module.exports = exports = factory
