const Model = require('../models');

async function getDistinctStoreTimezones() {
    const distinctTimezones = await Model.knex().raw(
        'SELECT DISTINCT("timeZone")  FROM "storeSettings" WHERE "timeZone" IS NOT NULL',
    );
    if (distinctTimezones.rows.length) {
        return distinctTimezones.rows.map((row) => row.timeZone);
    }
    return distinctTimezones.rows;
}

module.exports = {
    getDistinctStoreTimezones,
};
