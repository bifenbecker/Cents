const { task, desc } = require('jake');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const Model = require('../models');

desc('Updating orderableType name to ServiceOrder for service orders.');

task('update_orderable_type', async () => {
    try {
        const query = `
        update orders set "orderableType" = 'ServiceOrder'
        where "orderableType" = 'serviceOrder';
        `;
        await Model.query().knex().raw(query);
    } catch (error) {
        LoggerHandler('error', error);
    }
});
