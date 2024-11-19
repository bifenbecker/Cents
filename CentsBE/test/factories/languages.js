const { factory } = require('factory-girl');
const Language = require('../../models/language');
const FindOrCreateAdapter = require('../support/findOrCreateAdapter');

factory.define('language', Language, {
    language: 'English',
});
factory.setAdapter(new FindOrCreateAdapter('language'), 'language');

module.exports = exports = factory;
