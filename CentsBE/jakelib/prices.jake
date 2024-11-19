const Price = require('../models/pricePerPound.js');

let { task, desc } = require('jake');

desc('Fix Data Inconsistency in prices table');
task('fix_business_id', async function () {
    const UPDATE_SQL_QUERY = `
        UPDATE prices pr
        SET "businessId"=(select stores."businessId" from stores  where stores.id = pr."storeId")
        where pr."businessId" is null and pr."storeId" is not null
    `;
    await Price.knex().raw(UPDATE_SQL_QUERY);
});
