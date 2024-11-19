const { pick } = require('lodash');

const { getPrice } = require('./priceCalculations');
const Modifier = require('../../../models/modifiers');
const ModifierVersion = require('../../../models/modifierVersions');
const ServiceModifiers = require('../../../models/serviceModifiers');

async function modifierDetails(serviceModifierId, transaction) {
    let modifierDetail = {};
    const serviceModifier = await ServiceModifiers.query(transaction)
        .findById(serviceModifierId)
        .withGraphJoined('modifier');
    let { modifier } = serviceModifier;

    // check if latestModifierVersion exists
    if (!modifier.latestModifierVersion) {
        // add modifierVersion
        const modifierVersion = await ModifierVersion.query(transaction).insert({
            modifierId: modifier.id,
            ...pick(modifier, ['name', 'price', 'description', 'pricingType']),
        });

        // patch modifier with latestModifierVersion
        modifier = await Modifier.query(transaction)
            .patchAndFetchById(modifier.id, {
                latestModifierVersion: modifierVersion.id,
            })
            .returning('*');
    }

    modifierDetail = modifier;
    modifierDetail.serviceModifierId = serviceModifierId;
    modifierDetail.serviceId = serviceModifier.serviceId;
    modifierDetail.pricingType = serviceModifier.modifier.pricingType;

    return modifierDetail;
}

function modifiersPayload(status, weight, serviceModifierIds, pricingType, transaction) {
    return serviceModifierIds.map(async (serviceModifierId) => {
        const modifier = await modifierDetails(serviceModifierId, transaction);
        const serviceModifier = {
            status,
            serviceModifierId,
            price: modifier.price,
            name: modifier.name,
            lineItemType: 'MODIFIER',
            perItemPrice: modifier.price,
            description: modifier.description,
            weight,
            count: weight,
            pricingType,
            serviceId: modifier.serviceId,
            modifierId: modifier.id,
            modifierPricingType: modifier.pricingType,
            modifierVersionId: modifier.latestModifierVersion,
        };
        return serviceModifier;
    });
}

function existingModifiersPayload(existingModifiers, serviceItemsModifiers) {
    existingModifiers.forEach((modifier) => {
        const serviceItemModifier = serviceItemsModifiers.find(
            (serviceModifier) =>
                serviceModifier.serviceModifierId === modifier.referenceItems[0].serviceModifierId,
        );
        if (serviceItemModifier) {
            serviceItemModifier.id = modifier.id;
        }
    });
}

async function buildOrderItemsPayload(payload) {
    const { transaction, orderItems, status, existingModifiers = [] } = payload;
    const newPayload = payload;
    const serviceItemsModifiers = [];
    const orderItemsPayload = await Promise.all(
        orderItems
            .filter((orderItem) => !orderItem.isDeleted)
            .map(async (orderItem) => {
                let modifiers = [];
                if (orderItem.serviceModifierIds && orderItem.serviceModifierIds.length) {
                    modifiers = await Promise.all(
                        modifiersPayload(
                            status,
                            orderItem.weight,
                            orderItem.serviceModifierIds,
                            orderItem.pricingType,
                            transaction,
                        ),
                    );

                    serviceItemsModifiers.push(...modifiers);
                }
                const totalPrice = await getPrice({
                    transaction,
                    modifiers,
                    ...orderItem,
                });
                const item = {
                    status,
                    price: orderItem.perItemPrice,
                    totalPrice: Number(totalPrice.toFixed(2)),
                    modifiers,
                    ...orderItem,
                };
                item[orderItem.lineItemType === 'SERVICE' ? 'serviceId' : 'inventoryId'] =
                    orderItem.priceId;
                return item;
            }),
    );
    if (existingModifiers.length) {
        existingModifiersPayload(existingModifiers, serviceItemsModifiers);
    }
    newPayload.serviceOrderItems = orderItemsPayload.concat(serviceItemsModifiers);
    newPayload.orderItemsTotal = orderItemsPayload.reduce(
        (previous, current) => previous + current.totalPrice,
        0,
    );
    return newPayload;
}

module.exports = exports = buildOrderItemsPayload;
