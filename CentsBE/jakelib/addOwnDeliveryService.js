const { task, desc } = require('jake');
const { transaction, raw } = require('objection');

const LaundromatBusiness = require('../models/laundromatBusiness');
const Service = require('../models/services');
const JakeTasksLog = require('../models/jakeTasksLog');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

async function getStoresAndServiceCategory() {
    const data = await LaundromatBusiness.query()
        .select(
            'laundromatBusiness.id as businessId',
            raw('array_agg(distinct stores.id) as "storeIds"'),
            'serviceCategories.id as serviceCategoryId',
        )
        .leftJoin('stores', 'stores.businessId', 'laundromatBusiness.id')
        .join('serviceCategories', 'serviceCategories.businessId', 'laundromatBusiness.id')
        .where('category', 'DELIVERY')
        .groupBy('laundromatBusiness.id', 'serviceCategories.id')
        .orderBy('businessId');
    return data;
}

function mapData(data) {
    const resp = [];
    const services = [
        {
            name: 'Pickup - On Demand',
            price: 1,
        },
        {
            name: 'Pickup',
            price: 0,
        },
        {
            name: 'Delivery',
            price: 0,
        },
    ];
    for (const i of services) {
        for (const j of data) {
            const { serviceCategoryId, storeIds } = j;
            const temp = {
                serviceCategoryId,
                defaultPrice: i.price,
                name: i.name,
                minQty: null,
                minPrice: null,
                hasMinPrice: false,
                prices: storeIds
                    .filter((storeId) => storeId)
                    .map((storeId) => ({
                        storeId,
                        storePrice: i.price,
                        minPrice: null,
                        minQty: null,
                    })),
            };
            resp.push(temp);
        }
    }
    return resp;
}

desc('add pick up and delivery services for own driver delivery.');

task('add_delivery_services', async () => {
    let trx = null;
    try {
        const storesAndCategory = await getStoresAndServiceCategory();
        const mappedStoresAndCategory = mapData(storesAndCategory);
        trx = await transaction.start(LaundromatBusiness.knex());
        await Service.query(trx).insertGraph(mappedStoresAndCategory);
        await JakeTasksLog.query(trx).insert({
            taskName: 'add_own_delivery_services',
        });
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
