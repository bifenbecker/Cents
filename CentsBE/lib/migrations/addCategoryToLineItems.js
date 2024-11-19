const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const ServiceReferenceItemDetail = require('../../models/serviceReferenceItemDetail');
const logger = require('../logger');

const mapIndividualCategories = async (lineItem) => {
    let categoryName = null;

    if (lineItem.soldItemType === 'InventoryItem') {
        categoryName = lineItem.inventoryItem.inventory.inventoryCategory.name;
    } else if (lineItem.soldItemType === 'ServicesMaster') {
        categoryName = lineItem.serviceMaster.serviceCategory.category;
    } else {
        categoryName = lineItem.servicePrice.service.serviceCategory.category;
    }

    LoggerHandler('info', `categoryName: ${categoryName}`);

    await ServiceReferenceItemDetail.query().findById(lineItem.id).patch({
        category: categoryName,
    });
};

const retrieveAllLineItemCategories = (lineItems) => {
    if (!lineItems.length) {
        return [];
    }
    const response = [];
    for (const lineItem of lineItems) {
        response.push(mapIndividualCategories(lineItem));
    }
    return Promise.all(response);
};

const addCategoryToLineItems = async (options) => {
    try {
        const lineItemDetails = await ServiceReferenceItemDetail.query()
            .withGraphFetched(
                `[
                servicePrice.[service.[serviceCategory]],
                inventoryItem.[inventory.[inventoryCategory]],
                serviceMaster.[serviceCategory]
            ]`,
            )
            .limit(options.noOfRowsToProcess)
            .offset(options.noOfRowsProcessed)
            .orderBy(`${ServiceReferenceItemDetail.tableName}.id`, 'asc');

        await retrieveAllLineItemCategories(lineItemDetails);

        if (lineItemDetails.length > 0) {
            return addCategoryToLineItems({
                ...options,
                noOfRowsProcessed: options.noOfRowsProcessed + lineItemDetails.length,
            });
        }

        return null;
    } catch (err) {
        LoggerHandler('error', err);
        return null;
    }
};

module.exports = exports = addCategoryToLineItems;
