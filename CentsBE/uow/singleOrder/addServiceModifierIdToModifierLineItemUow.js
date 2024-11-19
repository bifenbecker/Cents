const ServicePrice = require('../../models/servicePrices');
const ServiceModifier = require('../../models/serviceModifiers');

/**
 * Add the serviceModifierIds for each lineItem
 *
 * @param {Object} lineItem
 * @param {Array} modifiers
 */
function addServiceModifierIdsToIndividualLineItem(lineItem, serviceModifiers) {
    const foundServiceModifierIds = serviceModifiers.filter(
        (modifier) => modifier.modifierId === lineItem.modifierId,
    );

    if (foundServiceModifierIds.length > 0) {
        const id = foundServiceModifierIds.map((modifier) => modifier.id);
        const [foundId] = id;
        lineItem.serviceModifierId = foundId;
    } else {
        lineItem.serviceModifierId = null;
    }

    return lineItem;
}

/**
 * Map serviceModifierIds to each modifierLineItem
 *
 * A) find the serviceId
 * B) need the modifierId
 *
 * @param {Object} orderItem
 */
async function addServiceModifierIdToModifierLineItems(orderItem) {
    let updatedModifierLineItems = [];

    if (orderItem?.modifierLineItems?.length === 0) {
        return orderItem?.modifierLineItems || [];
    }

    if (!orderItem?.servicePriceId) {
        return orderItem?.modifierLineItems || [];
    }

    const modifierIds = orderItem?.modifierLineItems?.map((lineItem) => lineItem.modifierId);
    const servicePrice = await ServicePrice.query()
        .withGraphFetched('service')
        .findById(orderItem.servicePriceId);
    const serviceModifiers = await ServiceModifier.query()
        .where({
            serviceId: servicePrice?.service?.id,
            isFeatured: true,
        })
        .whereIn('modifierId', modifierIds);

    updatedModifierLineItems = orderItem?.modifierLineItems?.map((lineItem) =>
        addServiceModifierIdsToIndividualLineItem(lineItem, serviceModifiers),
    );

    return updatedModifierLineItems;
}

module.exports = exports = {
    addServiceModifierIdToModifierLineItems,
};
