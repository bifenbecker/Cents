const { factory } = require('factory-girl');
const BagNoteTag = require('../../models/bagNoteTag');
require('./laundromatBusinesses');

factory.define('bagNoteTag', BagNoteTag, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    name: factory.chance('word'),
});

module.exports = exports = factory;
