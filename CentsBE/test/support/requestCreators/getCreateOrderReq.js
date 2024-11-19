const momenttz = require('moment-timezone');
const factory = require('../../factories');
const {
    createUserWithBusinessAndCustomerOrders: createBusiness,
} = require('../factoryCreators/createUserWithBusinessAndCustomerOrders');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { returnMethods } = require('../../../constants/constants');
const { addStore } = require('../../../elasticsearch/store/indexer');

const getCreateOrderReq = async ({
    store: storeAttrs,
    order: orderAttrs,
    businessCustomer: businessCustomerAttrs,
    pickup: pickupAttrs,
    return: returnAttrs,
    servicePrice: servicePriceAttrs,
    pickupCourierTip = 4,
    returnCourierTip = 4,
} = {}) => {
    const {
        centsCustomer,
        store,
        laundromatBusiness,
        businessPromotionPrograms,
        centsCustomerAddress,
        storeSettings,
        storeCustomer,
        order,
        serviceOrder,
    } = await createBusiness(
        { createBusinessPromotionPrograms: true },
        {
            store: storeAttrs,
            laundromatBusiness: {
                merchantId: 'merchantId',
            },
            order: orderAttrs || {},
            businessCustomer: businessCustomerAttrs || {},
        },
    );
    const serviceCategory = await factory.create(FN.serviceCategory, {
        businessId: laundromatBusiness.id,
    });
    const serviceMaster = await factory.create(FN.serviceMaster, {
        serviceCategoryId: serviceCategory.id,
    });
    const servicePrice = await factory.create(FN.servicePrice, {
        storeId: store.id,
        serviceId: serviceMaster.id,
        isDeliverable: true,
        ...servicePriceAttrs,
    });
    const modifier = await factory.create(FN.modifier, {
        businessId: laundromatBusiness.id,
    });
    const serviceModifier = await factory.create(FN.serviceModifier, {
        modifierId: modifier.id,
        serviceId: serviceMaster.id,
    });
    const startWindow = momenttz().add(2, 'd');
    const endWindow = momenttz().add(2, 'd').add(2, 'h');
    const timing = await factory.create(FN.timing, {
        startTime: startWindow.format(),
        endTime: endWindow.format(),
        day: 1,
    });
    await factory.create(FN.deliveryTimingSetting, {
        timingsId: timing.id,
        maxStops: 5,
    });
    const ownDeliverySetting = await factory.create(FN.ownDeliverySetting, {
        storeId: store.id,
        active: true,
        hasZones: true,
        zipCodes: [27565, 58282],
    });
    await addStore(store.id);

    return {
        entities: {
            businessPromotionPrograms,
            storeCustomer,
            centsCustomer,
            centsCustomerAddress,
            store,
            storeSettings,
            timing,
            order,
            serviceOrder,
            ownDeliverySetting,
            laundromatBusiness,
        },
        req: {
            testData: 'testData',
            params: { storeId: store.id },
            body: {
                storeId: store.id,
                servicePriceId: servicePrice.id,
                serviceModifierIds: [serviceModifier.id],
                customerNotes: null,
                customerAddressId: centsCustomerAddress.id,
                returnMethod: returnMethods.DELIVERY,
                paymentToken: 'paymentToken',
                promoCode: businessPromotionPrograms.name,
                bagCount: 1,
                subscription: {
                    interval: 1,
                    pickupWindow: [startWindow.valueOf(), endWindow.valueOf()],
                    returnWindow: [startWindow.valueOf(), endWindow.valueOf()],
                    servicePriceId: servicePrice.id,
                    modifierIds: [modifier.id],
                    pickupTimingsId: timing.id,
                    deliveryTimingsId: timing.id,
                },
                zipCode: 'ZIP_CODE',
                orderDelivery: {
                    pickup: {
                        type: 'PICKUP',
                        deliveryProvider: 'OWN_DRIVER',
                        deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                        thirdPartyDeliveryId: null,
                        timingsId: timing.id,
                        totalDeliveryCost: 10,
                        thirdPartyDeliveryCostInCents: 1000,
                        courierTip: pickupCourierTip,
                        subsidyInCents: 300,
                        ...pickupAttrs,
                    },
                    delivery: {
                        type: 'RETURN',
                        deliveryProvider: 'OWN_DRIVER',
                        deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                        thirdPartyDeliveryId: null,
                        timingsId: timing.id,
                        totalDeliveryCost: 10,
                        thirdPartyDeliveryCostInCents: 1000,
                        courierTip: returnCourierTip,
                        subsidyInCents: 300,
                        ...returnAttrs,
                    },
                },
            },
        },
    };
};

module.exports = {
    getCreateOrderReq,
};
