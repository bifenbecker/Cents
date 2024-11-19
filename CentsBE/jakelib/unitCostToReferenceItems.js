const { task, desc } = require('jake');
const { transaction } = require('objection');

const InventoryItem = require('../models/inventoryItem');
const ServicesMaster = require('../models/services');
const ServicePrices = require('../models/servicePrices');
const ServiceReferenceItem = require('../models/serviceReferenceItem');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

async function getServiceUnitCost(serviceId) {
    const service = await ServicesMaster.query().findById(serviceId);
    return service.defaultPrice;
}

async function getServicePriceUnitCost(servicePriceId) {
    const servicePrice = await ServicePrices.query().findById(servicePriceId);
    return servicePrice.storePrice;
}

async function getInventoryItemUnitCost(inventoryItemId) {
    const inventoryItem = await InventoryItem.query().findById(inventoryItemId);
    return inventoryItem.price;
}

async function getUnitCost(serviceId, servicePriceId, inventoryItemId) {
    if (serviceId != null && servicePriceId == null) return getServiceUnitCost(serviceId);

    if (serviceId == null && servicePriceId != null) return getServicePriceUnitCost(servicePriceId);

    if (serviceId != null && servicePriceId != null) return getServicePriceUnitCost(servicePriceId);

    if (inventoryItemId != null) return getInventoryItemUnitCost(inventoryItemId);

    return null;
}

async function addUnitCostToReferenceItem(serviceReferenceItem) {
    const { serviceId } = serviceReferenceItem;
    const { servicePriceId } = serviceReferenceItem;
    const { inventoryItemId } = serviceReferenceItem;

    const price = await getUnitCost(serviceId, servicePriceId, inventoryItemId);

    await ServiceReferenceItem.query()
        .findById(serviceReferenceItem.id)
        .patch({
            unitCost: price,
        })
        .returning('*');
}

desc('Set unitCost for each ServiceReferenceItem');
task('unitCost_for_serviceReferenceItems', async () => {
    let trx = null;
    try {
        const serviceReferenceItems = await ServiceReferenceItem.query();

        trx = await transaction.start(ServiceReferenceItem.knex());

        const referenceItemResult = serviceReferenceItems.map((item) =>
            addUnitCostToReferenceItem(item, trx),
        );

        await Promise.all(referenceItemResult);

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
