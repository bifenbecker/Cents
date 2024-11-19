const { task, desc } = require('jake');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const Model = require('../models');
const JakeTasksLog = require('../models/jakeTasksLog');

desc('Add ConvenienceFeeId to Service orders.');

task('add_convenienceFeeId_to_serviceOrders', async () => {
    try {
        const query = `
            with "filteredServiceOrders" as (
                select "id" as "serviceOrderId", "storeId" from "serviceOrders" where "convenienceFee" > 0
            ),
            "storesWithConvenienceFee" as (
                select s.id as "storeId", cf.id as "convenienceFeeId" from "stores" s
                join "filteredServiceOrders" on "filteredServiceOrders"."storeId"=s.id
                join "laundromatBusiness" lb on lb."id"=s."businessId"
                join "convenienceFees" cf on cf."businessId"=lb.id
                where "storeId"="filteredServiceOrders"."storeId"
                group by s.id, cf.id
            ),
            "serviceOrdersConvenienceFeeId" as (
                select "filteredServiceOrders"."serviceOrderId", "storesWithConvenienceFee"."convenienceFeeId" from "filteredServiceOrders"
                join "storesWithConvenienceFee" on "storesWithConvenienceFee"."storeId"= "filteredServiceOrders"."storeId"
                )
            update "serviceOrders"
            set
            "convenienceFeeId"="serviceOrdersConvenienceFeeId"."convenienceFeeId"
            from "serviceOrdersConvenienceFeeId"
            where "serviceOrders".id = "serviceOrdersConvenienceFeeId"."serviceOrderId"
        `;
        await Model.query().knex().raw(query);
        await JakeTasksLog.query().insert({
            taskName: 'add_convenienceFeeId_to_serviceOrders',
        });
    } catch (error) {
        LoggerHandler('error', error);
    }
});
