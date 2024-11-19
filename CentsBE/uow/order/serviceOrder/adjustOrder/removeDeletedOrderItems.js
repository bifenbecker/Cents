const _ = require('lodash');
const ServiceOrderItem = require('../../../../models/serviceOrderItem');

function orderItemPayload(serviceOrderItem) {
    return {
        id: serviceOrderItem.id,
        deletedAt: new Date().toISOString(),
        referenceItems: [
            {
                id: serviceOrderItem.referenceItems[0].id,
                orderItemId: serviceOrderItem.id,
                deletedAt: new Date().toISOString(),
                lineItemDetail: {
                    id: serviceOrderItem.referenceItems[0].li.id,
                    serviceReferenceItemId: serviceOrderItem.referenceItems[0].id,
                    deletedAt: new Date().toISOString(),
                    modifierLineItems: serviceOrderItem.referenceItems[0].li.ml?.map((item) => {
                        const updatedModifierLineItem = {
                            id: item?.id,
                            deletedAt: new Date().toISOString(),
                        };
                        return updatedModifierLineItem;
                    }),
                },
            },
        ],
    };
}

async function fetchModifiersToDelete(toDeleteModifierIds, serviceOrderId, transaction) {
    const toDeleteItems = await ServiceOrderItem.query(transaction)
        .withGraphJoined('referenceItems.[lineItemDetail as li]')
        .where('orderId', serviceOrderId)
        .where('referenceItems:li.soldItemType', 'Modifier')
        .whereIn('referenceItems.serviceModifierId', toDeleteModifierIds)
        .where('serviceOrderItems.deletedAt', null);

    return toDeleteItems.map((item) => orderItemPayload(item));
}

async function orderItemsToDelete(itemsToDelete, serviceOrderId, transaction) {
    const modifiers = [];
    const serviceItems = [];
    await Promise.all(
        itemsToDelete.map(async (item) => {
            const serviceOrderItem = await ServiceOrderItem.query(transaction)
                .findById(item.id)
                .withGraphJoined('referenceItems.[lineItemDetail as li.[modifierLineItems as ml]]')
                .where('serviceOrderItems.deletedAt', null);
            if (serviceOrderItem) {
                serviceItems.push(orderItemPayload(serviceOrderItem));
            }
            if (
                (item.category === 'PER_POUND' || item?.pricingType === 'PER_POUND') &&
                item.serviceModifierIds
            ) {
                const serviceOrderModifiers = await fetchModifiersToDelete(
                    item.serviceModifierIds,
                    serviceOrderId,
                    transaction,
                );
                modifiers.push(...serviceOrderModifiers);
            }
            return item;
        }),
    );
    return serviceItems.concat(modifiers);
}

async function perPoundItemModifiers(perPoundItem, serviceOrderId, transaction) {
    let toDeleteModifiers = [];

    const existingModifiers = await ServiceOrderItem.query(transaction)
        .where('orderId', serviceOrderId)
        .withGraphJoined('referenceItems.[lineItemDetail]')
        .where('referenceItems:lineItemDetail.soldItemType', 'Modifier')
        .where('serviceOrderItems.deletedAt', null);

    const existingModifiersIds = existingModifiers.map(
        (modifier) => modifier.referenceItems[0].serviceModifierId,
    );
    if (existingModifiersIds.length) {
        if (perPoundItem.serviceModifierIds.length) {
            // if modifiers are selected for the updated service item
            // 1. get the deleted modifiers
            // 2. remove the already existing modifiers from the serviceModifierIds
            //     array to avaoid duplicate creation

            const modifiersToDelete = _.difference(
                existingModifiersIds,
                perPoundItem.serviceModifierIds,
            );
            if (modifiersToDelete.length) {
                toDeleteModifiers = await fetchModifiersToDelete(
                    modifiersToDelete,
                    serviceOrderId,
                    transaction,
                );
            }
        } else if (existingModifiersIds.length && !perPoundItem.serviceModifierIds.length) {
            // delete all the modifiers
            toDeleteModifiers = await fetchModifiersToDelete(
                existingModifiersIds,
                serviceOrderId,
                transaction,
            );
        }
    }

    return { toDeleteModifiers, existingModifiers };
}

async function removeDeletedOrderItems(payload) {
    const { transaction, serviceOrderId } = payload;

    if (payload.orderItems.length) {
        const itemsToDelete = payload.orderItems.filter((orderItem) => orderItem.isDeleted);
        const totalItemsToDelete = [];
        if (itemsToDelete.length) {
            const serviceItemsAndModifiers = await orderItemsToDelete(
                itemsToDelete,
                serviceOrderId,
                transaction,
            );
            totalItemsToDelete.push(...serviceItemsAndModifiers);
        }
        const updatedPerPoundItem = payload.orderItems.find(
            (item) =>
                item.id &&
                !item.isDeleted &&
                (item?.category === 'PER_POUND' || item?.pricingType === 'PER_POUND'),
        );
        if (updatedPerPoundItem) {
            // check the modifiers
            const { toDeleteModifiers, existingModifiers } = await perPoundItemModifiers(
                updatedPerPoundItem,
                serviceOrderId,
                transaction,
            );
            totalItemsToDelete.push(...toDeleteModifiers);
            payload.existingModifiers = existingModifiers.filter(
                (modifier) =>
                    !toDeleteModifiers.includes(modifier.referenceItems[0].serviceModifierId),
            );
        }
        if (totalItemsToDelete.length) {
            payload.totalItemsToDelete = totalItemsToDelete;
        }
        payload.orderItems = _.difference(payload.orderItems, itemsToDelete);
    }
    return payload;
}
module.exports = exports = removeDeletedOrderItems;
