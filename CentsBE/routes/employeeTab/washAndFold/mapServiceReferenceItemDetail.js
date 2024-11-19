const InventoryItem = require('../../../models/inventoryItem');
const ServicePrices = require('../../../models/servicePrices');
const ServicesMaster = require('../../../models/services');
const Inventory = require('../../../models/inventory');
const ServiceCategories = require('../../../models/serviceCategories');
const InventoryCategory = require('../../../models/inventoryCategory');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const { pricingStructureTypes } = require('../../../constants/constants');

function returnMinPriceOrQuantity(minElement, serviceDetails) {
    return serviceDetails.hasMinPrice ? minElement : null;
}

/**
 * Generate the individual modifier line item that belongs to the parent line item
 *
 * @param {Object} modifier
 */
function applyIndividualModifier(modifier) {
    return {
        modifierId: modifier?.modifierId,
        modifierName: modifier?.name,
        unitCost: modifier?.price,
        quantity: modifier?.weight,
        totalCost: Number(Number(modifier?.price) * Number(modifier?.weight)),
        modifierPricingType: modifier.modifierPricingType,
        modifierVersionId: modifier?.modifierVersionId,
    };
}

/**
 * Generate the modifierLineItems array for a given line item
 *
 * @param {Array} modifiers
 */
function applyModifierLineItems(modifiers) {
    const modifierLineItems = modifiers.map((item) => applyIndividualModifier(item));
    return modifierLineItems;
}

/**
 * Function that uses a ReferenceItem object to format and return the
 * proper payload and data for a ServiceReferenceItemDetail object.
 *
 *
 * Using either the inventoryItemId or the servicePriceId, this function populates
 * the proper line item details, like name, description,
 * unit cost, total cost, and other relevant details
 *
 * @param {Object} referenceItem
 */
async function mapServiceReferenceItemDetail(referenceItem, customer = {}, modifiers = []) {
    const serviceReferenceItemDetail = {};

    try {
        const productOrServiceForeignKey = referenceItem.inventoryItemId
            ? referenceItem.inventoryItemId
            : referenceItem.servicePriceId;

        const lineItemModel = referenceItem.inventoryItemId ? InventoryItem : ServicePrices;

        const lineItemMasterModel = referenceItem.inventoryItemId ? Inventory : ServicesMaster;

        const lineItemCategoryModel = referenceItem.inventoryItemId
            ? InventoryCategory
            : ServiceCategories;

        const lineItemObject = await lineItemModel.query().findById(productOrServiceForeignKey);

        const productOrService = referenceItem.inventoryItemId
            ? await lineItemMasterModel.query().findById(lineItemObject.inventoryId)
            : await lineItemMasterModel
                  .query()
                  .withGraphFetched('pricingStructure')
                  .findById(lineItemObject.serviceId);

        const productOrServiceCategory = referenceItem.inventoryItemId
            ? await lineItemCategoryModel.query().findById(productOrService.categoryId)
            : await lineItemCategoryModel
                  .query()
                  .withGraphFetched('serviceCategoryType')
                  .findById(productOrService.serviceCategoryId);

        serviceReferenceItemDetail.soldItemId = productOrServiceForeignKey;
        serviceReferenceItemDetail.soldItemType = referenceItem.inventoryItemId
            ? 'InventoryItem'
            : 'ServicePrices';

        serviceReferenceItemDetail.lineItemName = referenceItem.inventoryItemId
            ? productOrService.productName
            : productOrService.name;

        serviceReferenceItemDetail.lineItemDescription = productOrService.description;
        serviceReferenceItemDetail.lineItemTotalCost = referenceItem.totalPrice;
        serviceReferenceItemDetail.lineItemQuantity = referenceItem.quantity;

        serviceReferenceItemDetail.lineItemUnitCost = referenceItem.inventoryItemId
            ? lineItemObject.price
            : lineItemObject.storePrice;

        serviceReferenceItemDetail.lineItemMinPrice = referenceItem.inventoryItemId
            ? null
            : returnMinPriceOrQuantity(lineItemObject.minPrice, productOrService);

        serviceReferenceItemDetail.lineItemMinQuantity = referenceItem.inventoryItemId
            ? null
            : returnMinPriceOrQuantity(lineItemObject.minQty, productOrService);

        serviceReferenceItemDetail.customerName = customer.fullName;
        serviceReferenceItemDetail.customerPhoneNumber = customer.phoneNumber;

        serviceReferenceItemDetail.category = referenceItem.inventoryItemId
            ? productOrServiceCategory.name
            : productOrServiceCategory.category;
        serviceReferenceItemDetail.pricingType = referenceItem.inventoryItemId
            ? pricingStructureTypes.FIXED_PRICE
            : productOrService?.pricingStructure?.type;
        serviceReferenceItemDetail.serviceCategoryType = referenceItem.inventoryItemId
            ? 'INVENTORY'
            : productOrServiceCategory?.serviceCategoryType?.type;

        if (modifiers?.length > 0) {
            serviceReferenceItemDetail.modifierLineItems = applyModifierLineItems(modifiers);
        }

        return serviceReferenceItemDetail;
    } catch (error) {
        LoggerHandler('error', error, {
            referenceItem,
            customer,
        });
        throw new Error(error);
    }
}

module.exports = exports = mapServiceReferenceItemDetail;
