const { factory } = require('factory-girl');
const CciSetting = require('../../models/cciSetting');
require('./stores');

factory.define('cciSetting', CciSetting, {
    storeId: factory.assoc('store', 'id'),
    username: 'user',
    password: 'password',
});

module.exports = exports = factory;
