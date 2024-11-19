const ConvenienceFee = require('../../../models/convenienceFee');

async function getConvenienceFeeId(storeId) {
    const details = await ConvenienceFee.query().knex().raw(`
    select cf."id" from  "stores" s
    join "businessSettings" bs on bs."businessId" = s."businessId"
    join "convenienceFees" cf on cf."businessId"=s."businessId" 
    where bs."hasConvenienceFee" is TRUE and s."id"=${storeId}`);
    return details.rows[0] ? details.rows[0].id : null;
}

module.exports = exports = {
    getConvenienceFeeId,
};
