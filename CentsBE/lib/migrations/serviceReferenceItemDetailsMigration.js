const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const ServiceReferenceItem = require('../../models/serviceReferenceItem');
const ServiceReferenceItemDetail = require('../../models/serviceReferenceItemDetail');
const User = require('../../models/user');
const logger = require('../logger');

const formatServiceReferenceItemDetail = async (serviceReferenceItem, customer) => {
    const serviceReferenceItemDetail = {};

    const serviceMaster = serviceReferenceItem.serviceId ? serviceReferenceItem.service$ : null;
    const servicePrice = serviceReferenceItem.servicePriceId
        ? serviceReferenceItem.servicePrice
        : null;
    const inventoryItem = serviceReferenceItem.inventoryItemId
        ? serviceReferenceItem.inventoryItem
        : null;
    const inventory = inventoryItem ? serviceReferenceItem.inventoryItem.inventory : null;
    const isServicePrice = servicePrice ? true : false;

    const properService =
        !inventoryItem && isServicePrice
            ? servicePrice
            : !inventoryItem && !isServicePrice
            ? serviceMaster
            : null;
    const properServiceName =
        !inventoryItem && isServicePrice
            ? servicePrice.service.name
            : !inventoryItem && !isServicePrice
            ? serviceMaster.name
            : null;
    const properServiceType =
        !inventoryItem && isServicePrice
            ? 'ServicePrices'
            : !inventoryItem && !isServicePrice
            ? 'ServicesMaster'
            : null;
    const properServicePrice =
        !inventoryItem && isServicePrice
            ? servicePrice.storePrice
            : !inventoryItem && !isServicePrice
            ? serviceMaster.defaultPrice
            : null;

    serviceReferenceItemDetail.serviceReferenceItemId = serviceReferenceItem.id;
    serviceReferenceItemDetail.soldItemId = inventoryItem ? inventoryItem.id : properService.id;
    serviceReferenceItemDetail.soldItemType = inventoryItem ? 'InventoryItem' : properServiceType;
    serviceReferenceItemDetail.lineItemName = inventoryItem
        ? inventory.productName
        : properServiceName;
    serviceReferenceItemDetail.lineItemDescription = inventoryItem
        ? inventory.description
        : properService.description;
    serviceReferenceItemDetail.lineItemTotalCost = serviceReferenceItem.orderItem.price;
    serviceReferenceItemDetail.lineItemQuantity = serviceReferenceItem.quantity
        ? serviceReferenceItem.quantity
        : 1;
    serviceReferenceItemDetail.lineItemUnitCost = inventoryItem
        ? inventoryItem.price
        : properServicePrice;
    serviceReferenceItemDetail.lineItemMinPrice = properService ? properService.minPrice : null;
    serviceReferenceItemDetail.lineItemMinQuantity = properService ? properService.minQty : null;
    serviceReferenceItemDetail.customerName = `${customer.firstname} ${customer.lastname}`;
    serviceReferenceItemDetail.customerPhoneNumber = customer.phone;
    serviceReferenceItemDetail.createdAt = serviceReferenceItem.createdAt;
    serviceReferenceItemDetail.updatedAt = serviceReferenceItem.updatedAt;

    return serviceReferenceItemDetail;
};

const mapIndividualServiceReferenceItemDetail = async (serviceReferenceItem, trx) => {
    const a = serviceReferenceItem;

    const serviceReferenceItemDetail = await ServiceReferenceItemDetail.query(trx).where(
        'serviceReferenceItemId',
        a.id,
    );

    LoggerHandler('info', serviceReferenceItemDetail);

    if (!serviceReferenceItemDetail.length) {
        const customer = await User.query(trx).findById(a.orderItem.serviceOrder.userId);
        const entry = await formatServiceReferenceItemDetail(a, customer);
        return entry;
    }
};

const retrieveAllServiceReferenceItemDetails = (serviceReferenceItems) => {
    if (!serviceReferenceItems.length) {
        return [];
    }
    const response = [];
    for (const lineItem of serviceReferenceItems) {
        response.push(mapIndividualServiceReferenceItemDetail(lineItem));
    }
    return Promise.all(response);
};

const migrateServiceReferenceItemDetails = async (options) => {
    try {
        const serviceReferenceItems = await ServiceReferenceItem.query()
            .withGraphFetched(
                `[
                servicePrice.[service],
                service$,
                inventoryItem.[inventory],
                orderItem.[serviceOrder]
            ]`,
            )
            .limit(options.noOfRowsToProcess)
            .offset(options.noOfRowsProcessed)
            .orderBy(`${ServiceReferenceItem.tableName}.id`, 'asc');

        const serviceReferenceItemDetails = await retrieveAllServiceReferenceItemDetails(
            serviceReferenceItems,
        );

        await ServiceReferenceItemDetail.query(options.trx).insert(serviceReferenceItemDetails);

        if (serviceReferenceItems.length > 0) {
            return migrateServiceReferenceItemDetails({
                ...options,
                noOfRowsProcessed: options.noOfRowsProcessed + serviceReferenceItems.length,
            });
        }

        return null;
    } catch (err) {
        LoggerHandler('error', err);
        return null;
    }
};

module.exports = exports = migrateServiceReferenceItemDetails;
