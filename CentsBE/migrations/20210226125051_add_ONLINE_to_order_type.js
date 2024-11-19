const formatAlterTableEnumSql = require('../utils/enumUpdateQuery');

exports.up = async function up(knex) {
    await knex.raw(
        formatAlterTableEnumSql('serviceOrders', 'orderType', ['RESIDENTIAL', 'SERVICE', 'ONLINE']),
    );
};

exports.down = async function down(knex) {
    return Promise.resolve();
};
