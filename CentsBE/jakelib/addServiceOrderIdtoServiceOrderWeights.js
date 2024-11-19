const { task, desc } = require('jake');
const Model = require('../models');

desc('Populating serviceOrderId to serviceOrderWeightLogs');

task('add_serviceOrderId_to_serviceOrderWeightLogs', async () => {
    const query = `
    update "serviceOrderWeights" set "serviceOrderId" =  t."serviceOrderId"
    from (
        select "serviceOrderItems"."orderId" as "serviceOrderId", "serviceOrderWeights".id as "serviceOrderWeightsId"
        from "serviceOrderWeights"
        join "serviceReferenceItems" on "serviceReferenceItems".id = "serviceOrderWeights"."referenceItemId"
        join "serviceOrderItems" on "serviceOrderItems".id = "serviceReferenceItems"."orderItemId"
        order by "serviceOrderId"
    ) t
    where t."serviceOrderWeightsId" = "serviceOrderWeights".id;`;
    await Model.query().knex().raw(query);
});
