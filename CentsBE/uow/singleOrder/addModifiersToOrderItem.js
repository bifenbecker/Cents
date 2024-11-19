const ServicePrice = require('../../models/servicePrices');
const ServiceModifier = require('../../models/serviceModifiers');

/**
 * For each orderItem, find the ServiceMaster and determine if there is a ServiceModifier
 * entry that includes both the modifierId and the serviceId
 *
 * If there is, we should only include that modifier in the list of modifiers for the
 * indvidual orderItem
 *
 * @param {Object} orderItem
 * @param {Array} modifiers
 */
async function addModifiersToOrderItem(orderItem, modifiers) {
    const updatedListOfModifiers = [];

    if (orderItem.soldItemType !== 'ServicePrices') {
        return updatedListOfModifiers;
    }

    const servicePrice = await ServicePrice.query()
        .withGraphFetched('service')
        .findById(orderItem.servicePriceId);
    const serviceModifierIds = modifiers.map((modifier) => modifier.serviceModifierId);

    const serviceModifiers = await ServiceModifier.query()
        .where({
            serviceId: servicePrice?.service?.id,
            isFeatured: true,
        })
        .whereIn('id', serviceModifierIds);
    const matchingServiceModifierIds = serviceModifiers.map((item) => item.id);
    const finalModifiersToInclude = modifiers.filter((modifier) =>
        matchingServiceModifierIds.includes(modifier.serviceModifierId),
    );

    return finalModifiersToInclude;
}

module.exports = exports = {
    addModifiersToOrderItem,
};
