const { task, desc } = require('jake');
const { raw, transaction } = require('objection');
const LaundromatBusiness = require('../models/laundromatBusiness');
const Category = require('../models/serviceCategories');
const JakeTasksLog = require('../models/jakeTasksLog');
const { deliveryServices } = require('../constants/constants');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

async function getData() {
    const data = await LaundromatBusiness.query()
        .select(
            'laundromatBusiness.id as businessId',
            raw('array_agg(distinct stores.id) as stores'),
        )
        .leftJoin('stores', 'stores.businessId', 'laundromatBusiness.id ')
        .whereRaw(
            '"laundromatBusiness".id not in (select "businessId" from "serviceCategories" where category = \'DELIVERY\')',
        )
        .groupBy('laundromatBusiness.id');
    // insert category, service, prices.
    const response = [];
    for (const i of data) {
        const category = {
            businessId: i.businessId,
            category: 'DELIVERY',
            services: Object.values(deliveryServices).map((deliveryService) => ({
                defaultPrice: 1,
                name: deliveryService,
                minQty: null,
                minPrice: null,
                hasMinPrice: false,
                prices: i.stores
                    .filter((store) => store)
                    .map((storeId) => ({
                        storeId,
                        storePrice: 1,
                        minPrice: null,
                        minQty: null,
                    })),
            })),
        };
        response.push(category);
    }
    return response;
}

desc('Added missing delivery services and category for businesses.');

task('add_missing_delivery_services', async () => {
    let trx = null;
    try {
        const data = await getData();
        trx = await transaction.start(LaundromatBusiness.knex());
        await Category.query(trx).insertGraph(data);
        await JakeTasksLog.query(trx).insert({
            taskName: 'add_missing_delivery_services',
        });
        await trx.commit();
    } catch (error) {
        LoggerHandler('error', error);
    }
});
