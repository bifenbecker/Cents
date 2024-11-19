const { pick } = require('lodash');
const { getServicePriceDetails } = require('../../services/washServices/queries');
const { getServiceModifiers } = require('../../services/washServices/modifiers/queries');
const ModifierVersion = require('../../models/modifierVersions');
const Modifier = require('../../models/modifiers');

async function addLatestModifierVersion(modifier, transaction) {
    if (!modifier.latestModifierVersion) {
        const modifierVersion = await ModifierVersion.query(transaction).insert({
            modifierId: modifier.modifierId,
            pricingType: modifier.modifierPricingType,
            ...pick(modifier, ['name', 'price', 'description']),
        });

        // patch modifier with latestModifierVersion
        await Modifier.query(transaction)
            .patchAndFetchById(modifier.modifierId, {
                latestModifierVersion: modifierVersion.id,
            })
            .returning('*');

        modifier.latestModifierVersion = modifierVersion.id;
    }

    return modifier;
}

const deliverableServicePriceAndModifierUow = async (payload) => {
    const { servicePriceId, serviceModifierIds, storeId } = payload;
    const orderItems = [];
    if (!servicePriceId) {
        payload.orderItems = orderItems;
        return payload;
    }
    const service = await getServicePriceDetails(servicePriceId);
    if (!service) throw new Error('Service not found.');

    if (
        !((service.pricingTierId || service.storeId === Number(storeId)) && service.isDeliverable)
    ) {
        throw new Error('Service is not available for the selected store.');
    }

    if (serviceModifierIds && serviceModifierIds.length) {
        const modifiers = await getServiceModifiers(service.serviceId, serviceModifierIds);
        if (modifiers.length !== serviceModifierIds.length) {
            throw new Error('Invalid modifier id(s).');
        }

        const updatedModifiers = await Promise.all(
            modifiers.map((modifier) => addLatestModifierVersion(modifier, payload.transaction)),
        );

        service.modifiers = updatedModifiers;

        orderItems.push(...updatedModifiers);
    }

    orderItems.push(service);
    payload.orderItems = orderItems;
    return payload;
};

module.exports = exports = deliverableServicePriceAndModifierUow;
