const { factory } = require('factory-girl');
const SpyderWashSettings = require('../../models/spyderWashSettings');
require('./stores');

factory.define('spyderWashSettings', SpyderWashSettings, {
    storeId: factory.assoc('store', 'id'),
    email: factory.chance('email'),
    password: factory.chance('word'),
    posId: factory.chance('word'),
    operatorCode: factory.chance('integer', { min: 0, max: 9999 }).toString(),
    locationCode: factory.chance('integer', { min: 0, max: 9999 }).toString(),
});

module.exports = exports = factory;
