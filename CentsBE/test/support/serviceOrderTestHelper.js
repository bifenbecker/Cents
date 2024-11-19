const faker = require('faker');
const factory = require('../factories');
const Turn = require('../../models/turns');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
const { statuses, returnMethods, ORDER_TYPES } = require('../../constants/constants');
const ServiceOrderItem = require('../../models/serviceOrderItem');

async function createNonTaxableServicePayload(store, categoryType = 'FIXED_PRICE') {
    const serviceCategory = await createServiceCategory(store.businessId, categoryType);
    const serviceMaster = await createServiceMaster(serviceCategory.id);
    const servicePrice = await createServicePrice(store.id, serviceMaster.id, 10, false);
    const modifier = await createModifier(store.businessId);

    const serviceModifier = await createServiceModifier(serviceMaster.id, modifier.id);

    return {
        serviceCategory,
        serviceMaster,
        servicePrice,
        serviceModifier,
        modifier,
    };
}

async function createNonTaxableInventoryPayload(store, categoryType = 'FIXED_PRICE') {
    const inventoryCategory = await createInventoryCategory(store.businessId);
    const inventory = await createInventory(inventoryCategory.id);
    const inventoryItem = await createInventoryItem(store.id, inventory.id, false);
    return {
        inventoryItem,
        inventory,
    };
}

function createServiceCategory(businessId, categoryType) {
    return factory.create('serviceCategory', {
        businessId,
        category: categoryType,
    });
}

async function createServiceMaster(serviceCategoryId, pricingType = null) {
    const pricingStructure = await factory.create(FN.servicePricingStructure, {
        type: pricingType || 'FIXED_PRICE',
    });
    return factory.create('serviceMaster', {
        serviceCategoryId,
        servicePricingStructureId: pricingStructure.id,
    });
}

function createServicePrice(storeId, serviceId, minPrice, taxable = true) {
    return factory.create('servicePrice', {
        storeId,
        serviceId,
        minPrice,
        isTaxable: taxable,
        isDeliverable: true,
    });
}

function createModifier(businessId) {
    return factory.create('modifier', {
        businessId,
    });
}

function createServiceModifier(serviceId, modifierId) {
    return factory.create('serviceModifier', {
        serviceId,
        isFeatured: true,
        modifierId,
    });
}

async function createServicePayload(store, categoryType = 'FIXED_PRICE', minPrice = 10) {
    const serviceCategory = await createServiceCategory(store.businessId, categoryType);
    const serviceMaster = await createServiceMaster(serviceCategory.id, categoryType);
    const servicePrice = await createServicePrice(store.id, serviceMaster.id, minPrice);

    const modifier = await createModifier(store.businessId);

    const serviceModifier = await createServiceModifier(serviceMaster.id, modifier.id);

    return {
        serviceCategory,
        serviceMaster,
        servicePrice,
        serviceModifier,
        modifier,
    };
}

function createInventoryCategory(businessId) {
    return factory.create('inventoryCategory', {
        businessId,
    });
}

function createInventory(inventoryCategoryId) {
    return factory.create('inventory', {
        categoryId: inventoryCategoryId,
    });
}

function createInventoryItem(storeId, inventoryId, taxable = true) {
    return factory.create('inventoryItem', {
        storeId,
        inventoryId,
        isTaxable: taxable,
        price: 15
    });
}

async function createInventoryPayload(store) {
    const inventoryCategory = await createInventoryCategory(store.businessId);
    const inventory = await createInventory(inventoryCategory.id);
    const inventoryItem = await createInventoryItem(store.id, inventory.id);
    return {
        inventoryItem,
        inventory,
    };
}

async function createWeightLogs({ serviceOrderId, step, orderWeights, teamMember }) {
    let orderWeightLogs,
        totalWeight = 0;

    orderWeightLogs = await Promise.all(
        orderWeights.map(async (weight) => {
            return await factory.create('serviceOrderWeight', {
                teamMemberId: teamMember ? teamMember.id : (await factory.create('teamMember')).id,
                serviceOrderId,
                step,
                totalWeight: weight,
                chargeableWeight: weight,
            });
        }),
    );

    totalWeight = orderWeights.reduce((prev, curr) => prev + curr, 0);

    return {
        orderWeightLogs,
        totalWeight,
    };
}

async function createCompletedServiceOrder(store, options = {}) {
    // TODO: setup returnMethod and orderTypes;
    const {
        withActivityLogs = false,
        withPayment = false,
        intakeWeights = [10],
        beforeProcessingWeights = [10],
        afterProcessingWeights = [10],
        completionWeights = [10],
        serviceOrderFields = {},
        withWashingTurns = false,
        withDryingTurns = false,
    } = options;

    let activityLogs = {};
    let payment,
        intakeMember,
        totalIntakeWeight,
        washingMember,
        totalBeforeProcessingWeight,
        completeProcessingMember,
        totalAfterProcessingWeight,
        completeOrPickupMember,
        totalCompletionWeight,
        washingTurnUser,
        dryingTurnUser;

    // creating customer
    const centsCustomer = await factory.create(FN.centsCustomer);
    const storeCustomer = await factory.create(FN.storeCustomer, {
        businessId: store.businessId,
        storeId: store.id,
        centsCustomerId: centsCustomer.id,
    });

    // creating service items and modifiers
    const { serviceCategory, serviceMaster, modifier, servicePrice, serviceModifier } =
        await createServicePayload(store, 'PER_POUND');

    // creating basic serviceOrder
    const serviceOrder = await factory.create(FN.serviceOrder, {
        storeId: store.id,
        status: statuses.COMPLETED,
        storeCustomerId: storeCustomer.id,
        completedAt: new Date().toISOString(),
        tipAmount: 5,
        netOrderTotal: 20,
        orderType: ORDER_TYPES.SERVICE,
        returnMethod: returnMethods.IN_STORE_PICKUP,
        ...serviceOrderFields,
    });

    // TODO: Define deliveries and other details depending on orderType and returnMethod

    // creating order.
    const order = await factory.create(FN.serviceOrderMasterOrder, {
        orderableId: serviceOrder.id,
    });

    // creating activity logs
    if (withActivityLogs) {
        intakeMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
        });
        washingMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
        });
        completeProcessingMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
        });
        completeOrPickupMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
        });

        activityLogs = {
            intake: await factory.create(FN.orderActivityLog, {
                orderId: serviceOrder.id,
                status: statuses.READY_FOR_PROCESSING,
                teamMemberId: intakeMember.id,
                employeeName: `${store.name} Intake Employee`,
                updatedAt: new Date().toISOString(),
            }),
            washing: await factory.create(FN.orderActivityLog, {
                orderId: serviceOrder.id,
                status: statuses.PROCESSING,
                teamMemberId: washingMember.id,
                employeeName: `${store.name} Washing Employee`,
                updatedAt: new Date().toISOString(),
            }),
            completeProcessing: await factory.create(FN.orderActivityLog, {
                orderId: serviceOrder.id,
                status: statuses.READY_FOR_PICKUP,
                teamMemberId: completeProcessingMember.id,
                employeeName: `${store.name} CompleteProcessing Employee`,
                updatedAt: new Date().toISOString(),
            }),
            completeOrPickup: await factory.create(FN.orderActivityLog, {
                orderId: serviceOrder.id,
                status: statuses.COMPLETED,
                teamMemberId: completeOrPickupMember.id,
                employeeName: `${store.name} CompleteOrPickup Employee`,
                updatedAt: new Date().toISOString(),
            }),
        };
    }

    if (withWashingTurns) {
        const machine = await factory.create(FN.machineWasher);
        washingTurnUser = await factory.create(FN.user, {
            firstname: `${store.name} Washing User`,
            lastname: 'User',
        });
        washingTurnUser.fullName = washingTurnUser.firstname + ' ' + washingTurnUser.lastname;
        const turn = await factory.create(FN.turn, {
            machineId: machine.id,
            userId: washingTurnUser.id,
            updatedAt: new Date().toISOString(),
        });
        washingTurnUser.updatedAt = turn.updatedAt;
        const serviceOrderTurn = await factory.create(FN.serviceOrderTurns, {
            serviceOrderId: serviceOrder.id,
            turnId: turn.id,
        });
    }

    if (withDryingTurns) {
        const machine = await factory.create(FN.machineDryer);
        dryingTurnUser = await factory.create(FN.user, {
            firstname: `${store.name} Drying User`,
            lastname: 'User',
        });
        dryingTurnUser.fullName = dryingTurnUser.firstname + ' ' + dryingTurnUser.lastname;
        const turn = await factory.create(FN.turn, {
            machineId: machine.id,
            userId: dryingTurnUser.id,
            updatedAt: new Date().toISOString(),
        });
        dryingTurnUser.updatedAt = turn.updatedAt;
        const serviceOrderTurn = await factory.create(FN.serviceOrderTurns, {
            serviceOrderId: serviceOrder.id,
            turnId: turn.id,
        });
    }

    // Create intake weight record
    if (intakeWeights) {
        ({ totalWeight: totalIntakeWeight } = await createWeightLogs({
            serviceOrderId: serviceOrder.id,
            step: 1,
            orderWeights: intakeWeights,
            teamMember: intakeMember,
        }));
    }

    if (beforeProcessingWeights) {
        ({ totalWeight: totalBeforeProcessingWeight } = await createWeightLogs({
            serviceOrderId: serviceOrder.id,
            step: 2,
            orderWeights: beforeProcessingWeights,
            teamMember: washingMember,
        }));
    }

    if (afterProcessingWeights) {
        ({ totalWeight: totalAfterProcessingWeight } = await createWeightLogs({
            serviceOrderId: serviceOrder.id,
            step: 3,
            orderWeights: afterProcessingWeights,
            teamMember: completeProcessingMember,
        }));
    }

    if (completionWeights) {
        ({ totalWeight: totalCompletionWeight } = await createWeightLogs({
            serviceOrderId: serviceOrder.id,
            step: 4,
            orderWeights: completionWeights,
            teamMember: completeOrPickupMember,
        }));
    }

    // creating payment
    if (withPayment) {
        payment = await factory.create('payments', {
            status: 'succeeded',
            storeId: store.id,
            orderId: order.id,
        });
    }

    return {
        order,
        serviceOrder,
        activityLogs,
        payment,
        centsCustomer,
        storeCustomer,
        serviceCategory,
        serviceMaster,
        servicePrice,
        serviceModifier,
        modifier,
        totalIntakeWeight: totalIntakeWeight ?? intakeWeights,
        totalBeforeProcessingWeight: totalBeforeProcessingWeight ?? beforeProcessingWeights,
        totalAfterProcessingWeight: totalAfterProcessingWeight ?? afterProcessingWeights,
        totalCompletionWeight: totalCompletionWeight ?? completionWeights,
        washingTurnUser,
        dryingTurnUser,
    };
}

async function createServiceOrderWithLineItems(orderPayload, lineItemDetails, businessId) {
    const serviceOrderWithItem = await factory.create('serviceOrderWithItems', { ...orderPayload });
    await factory.create('serviceOrderMasterOrder', {
        orderableId: serviceOrderWithItem.id,
        storeId: serviceOrderWithItem.storeId,
        orderableType: 'ServiceOrder',
    });
    const serviceOrderItem = await ServiceOrderItem.query().findOne(
        'orderId',
        serviceOrderWithItem.id,
    );
    const serviceReferenceItem = await factory.create('serviceReferenceItem', {
        orderItemId: serviceOrderItem.id,
    });
    const modifier = await factory.create('modifier', { businessId });
    const serviceReferenceItemDetailItem = await factory.create('serviceReferenceItemDetail', {
        serviceReferenceItemId: serviceReferenceItem.id,
        soldItemId: modifier.id,
        soldItemType: lineItemDetails.soldItemType ? lineItemDetails.soldItemType : 'Modifier',
        lineItemName: 'test',
        lineItemTotalCost: lineItemDetails.lineItemTotalCost,
        lineItemUnitCost: 1,
        category: lineItemDetails.category,
    });
    if (lineItemDetails?.soldItemType === 'Modifier') {
       await factory.create(FN.serviceReferenceItemDetailModifier, {
            serviceReferenceItemDetailId: serviceReferenceItemDetailItem.id,
       });
    }
    return serviceReferenceItemDetailItem;
}

async function createInventoryOrderWithLineItems(payload, lineItemDetails) {
    const inventoryOrder = await factory.create('inventoryOrder', {
        ...payload,
    });
    await factory.create('inventoryOrderMasterOrder', {
        orderableId: inventoryOrder.id,
    });
    const itemId = await factory.create('inventoryItem', {
        storeId: payload.storeId,
    });
    const inventoryOrderItemDetail = await factory.create('inventoryOrderItem', {
        inventoryItemId: itemId.id,
        inventoryOrderId: inventoryOrder.id,
        lineItemTotalCost: lineItemDetails.lineItemTotalCost,
    });
    return inventoryOrderItemDetail;
}

async function createServiceOrderTurn(serviceOrder, machine) {
    const { id: serviceOrderId, storeId, storeCustomerId, userId } = serviceOrder;
    const { id: machineId } = machine;

    const device = await factory.create(FN.device, {
        name: faker.random.uuid(),
    });
    const turn = await factory.create(FN.turn, {
        storeId,
        storeCustomerId,
        machineId,
        deviceId: device.id,
        userId,
    });
    const serviceOrderTurn = await factory.create(FN.serviceOrderTurns, {
        turnId: turn.id,
        serviceOrderId,
    });

    return {
        device,
        turn,
        serviceOrderTurn,
    };
}

const patchTurnServiceType = async (turnId, serviceType) => {
    await Turn.query().patch({ serviceType }).findOne({ id: turnId });
};

async function createCompletedServiceOrderWithItemsAndPayments(storeId, orderItemsData, payments) {
    const itemDetails = [];

    const serviceOrder = await factory.create(FN.serviceOrder, {
        storeId: storeId,
        placedAt: new Date(),
        status: statuses.COMPLETED,
    });
    const masterOrder = await factory.create(FN.serviceOrderMasterOrder, {
        storeId: storeId,
        orderableId: serviceOrder.id,
    });

    for (const orderItemDataRaw of orderItemsData) {
        const { isInventoryItem = false, ...orderItemData } = orderItemDataRaw;

        const orderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
            createdAt: orderItemData.createdAt,
        });
        const referenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: orderItem.id,
        });
        itemDetails.push(
            await factory.create(
                isInventoryItem
                    ? FN.serviceReferenceItemDetailForInventoryItem
                    : FN.serviceReferenceItemDetailForServicePrice,
                {
                    serviceReferenceItemId: referenceItem.id,
                    ...orderItemData,
                },
            ),
        );
    }

    // deleted service order item
    await factory.create(FN.serviceOrderItem, {
        orderId: serviceOrder.id,
        deletedAt: new Date(),
    });

    for (const payment of payments) {
        await factory.create(FN.payment, {
            storeId: storeId,
            orderId: masterOrder.id,
            status: 'succeeded',
            ...payment,
        });
    }

    return itemDetails;
}

/**
 * Create the following:
 * 
 * 1) ServiceCategory business
 * 2) ServiceMaster that belongs to category
 * 3) ServicePrice that belongs to ServiceMaster
 * 4) Modifier that belong to business
 * 5) ServiceModifier that belongs to modifier and service
 * 6) ServiceOrder that belongs to store
 * 7) ServiceOrderItem that belongs to ServiceOrder
 * 8) ServiceReferenceItem that belongs to ServiceOrderItem and has servicePriceId
 * 9) ServiceReferenceItemDetail belonging to ServiceReferenceItem
 * 10) ServiceReferenceItemDetailModifier belonging to ServiceReferenceItemDetail
 * 
 * @param {Number} businessId 
 * @param {Number} storeId 
 */
async function createServiceOrderWithLineItemAndModifier(businessId, storeId) {
    const modifier = await factory.create(FN.modifier, {
        businessId,
    });
    const serviceCategory = await factory.create(FN.serviceCategory, {
        businessId,
        category: 'Custom Category',
    });
    const serviceMaster = await factory.create(FN.serviceMaster, {
        serviceCategoryId: serviceCategory.id,
    });
    const serviceModifier = await factory.create(FN.serviceModifier, {
        modifierId: modifier.id,
        serviceId: serviceMaster.id,
    });
    const servicePrice = await factory.create(FN.servicePrice, {
        serviceId: serviceMaster.id,
        storeId,
    });
    const serviceOrder = await factory.create(FN.serviceOrder, {
        storeId,
        netOrderTotal: faker.finance.amount(),
        balanceDue: faker.finance.amount(),
    });
    const order = await factory.create(FN.order, {
        storeId,
        orderableType: 'ServiceOrder',
        orderableId: serviceOrder.id,
    });
    const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
        orderId: serviceOrder.id,
    });  
    const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
        orderItemId: serviceOrderItem.id,
        servicePriceId: servicePrice.id,
    });
    const serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetailForServicePrice, {
        soldItemId: servicePrice.id,
        serviceReferenceItemId: serviceReferenceItem.id,
        lineItemQuantity: 10,
        category: serviceCategory.category,
        pricingType: 'PER_POUND',
    });
    const serviceReferenceItemDetailModifier = await factory.create(FN.serviceReferenceItemDetailModifier, {
        serviceReferenceItemDetailId: serviceReferenceItemDetail.id,
        modifierId: modifier.id,
        modifierName: modifier.name,
        unitCost: modifier.price,
        quantity: serviceReferenceItemDetail.lineItemQuantity,
        totalCost: Number(modifier.price * serviceReferenceItemDetail.lineItemQuantity),
        modifierPricingType: 'PER_POUND',
    });

    return {
        modifier,
        serviceCategory,
        serviceMaster,
        serviceModifier,
        servicePrice,
        serviceOrder,
        order,
        serviceOrderItem,
        serviceReferenceItem,
        serviceReferenceItemDetail,
        serviceReferenceItemDetailModifier,
    }
}

module.exports = {
    createServicePayload,
    createInventoryPayload,
    createNonTaxableServicePayload,
    createNonTaxableInventoryPayload,
    createCompletedServiceOrder,
    createServiceOrderWithLineItems,
    createInventoryOrderWithLineItems,
    createServiceOrderTurn,
    patchTurnServiceType,
    createCompletedServiceOrderWithItemsAndPayments,
    createServiceOrderWithLineItemAndModifier,
};
