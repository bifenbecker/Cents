const factory = require('../../factories');
const LaundromatBusiness = require('../../../models/laundromatBusiness');
const PartnerSubsidiaryStore = require('../../../models/partnerSubsidiaryStore');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { STRIPE_CREDENTIALS } = require('../../constants/responseMocks');

// Creates the following entities with associations and custom properties in one instance:
// - Users
// - LaundromatBusiness
// - ServiceCategories
// - Store
// - CentsCustomer
// - BusinessCustomer
// - StoreCustomer
// - PartnerEntity
// - PartnerSubsidiary
// - PartnerSubsidiaryStore
// - PartnerSubsidiaryPaymentMethod
// - ServiceOrder
// - Order

// Entities created by model hooks:
// - BusinessSettings
// - BusinessThemes
// - StoreTheme
// - StoreSetting

const createUserWithBusinessAndCustomerOrders = async (
    creationOptions = { createPartnerSubsidiary: false, createBusinessPromotionPrograms: false },
    customAttributes = {},
) => {
    const {
        user: userAttrs,
        laundromatBusiness: businessAttrs,
        store: storeAttrs,
        centsCustomer: centsCustomerAttrs,
        centsCustomerAddress: centsCustomerAddressAttrs,
        businessCustomer: businessCustomerAttrs,
        storeCustomer: storeCustomerAttrs,
        partnerEntity: partnerEntityAttrs,
        partnerSubsidiary: partnerSubsidiaryAttrs,
        partnerSubsidiaryPaymentMethod: partnerSubsidiaryPaymentMethodAttrs,
        partnerSubsidiaryStore: partnerSubsidiaryStoreAttrs,
        serviceOrder: serviceOrderAttrs,
        order: orderAttrs,
        businessPromotionPrograms: businessPromotionProgramsAttrs,
    } = customAttributes;
    const { createPartnerSubsidiary, createBusinessPromotionPrograms } = creationOptions;

    const userFactory = await factory.create(FN.user, {
        ...userAttrs,
    });
    const businessFactory = await factory.create(FN.laundromatBusiness, {
        merchantId: STRIPE_CREDENTIALS.destinationAccountId,
        userId: userFactory.id,
        ...businessAttrs,
    });
    const storeFactory = await factory.create(FN.store, {
        businessId: businessFactory.id,
        taxRateId: null,
        ...storeAttrs,
    });
    const centsCustomerFactory = await factory.create(FN.centsCustomer, {
        stripeCustomerId: STRIPE_CREDENTIALS.customerId,
        ...centsCustomerAttrs,
    });
    await factory.create(FN.centsCustomerAddress, {
        centsCustomerId: centsCustomerFactory.id,
        ...centsCustomerAddressAttrs,
    });
    const businessCustomerFactory = await factory.create(FN.businessCustomer, {
        businessId: businessFactory.id,
        centsCustomerId: centsCustomerFactory.id,
        ...businessCustomerAttrs,
    });
    const storeCustomerFactory = await factory.create(FN.storeCustomer, {
        storeId: storeFactory.id,
        centsCustomerId: centsCustomerFactory.id,
        businessId: businessFactory.id,
        businessCustomerId: businessCustomerFactory.id,
        ...storeCustomerAttrs,
    });
    const serviceOrderFactory = await factory.create(
        FN.serviceOrderReadyForProcessingWithDeliveryReturnMethod,
        {
            storeId: storeFactory.id,
            hubId: storeFactory.id,
            storeCustomerId: storeCustomerFactory.id,
            ...serviceOrderAttrs,
        },
    );
    await factory.create(FN.serviceOrderMasterOrder, {
        storeId: storeFactory.id,
        orderableId: serviceOrderFactory.id,
        ...orderAttrs,
    });

    if (createBusinessPromotionPrograms) {
        await factory.create(FN.promotion, {
            businessId: businessFactory.id,
            active: true,
            customerRedemptionLimit: 0,
            ...businessPromotionProgramsAttrs,
        });
    }

    const {
        businessTheme,
        settings: businessSettings,
        user,
        promotionPrograms,
        stores: [
            {
                storeTheme,
                settings: storeSettings,
                orders: [{ order, ...serviceOrder }],
                storeCustomers: [
                    {
                        centsCustomer: {
                            addresses: [centsCustomerAddress],
                            ...centsCustomer
                        },
                        businessCustomer,
                        ...storeCustomer
                    },
                ],
                ...store
            },
        ],
        ...laundromatBusiness
    } = await LaundromatBusiness.query()
        .findById(businessFactory.id)
        .withGraphFetched(
            `[${
                createBusinessPromotionPrograms ? 'promotionPrograms, ' : ''
            }businessTheme, settings, user, stores.[storeTheme, settings, orders.order, storeCustomers.[centsCustomer.addresses, businessCustomer]]]`,
        );
    let optionalEntities = {};
    if (createPartnerSubsidiary) {
        const partnerEntityFactory = await factory.create(FN.partnerEntity, {
            ...partnerEntityAttrs,
        });
        const partnerSubsidiaryFactory = await factory.create(FN.partnerSubsidiary, {
            partnerEntityId: partnerEntityFactory.id,
            ...partnerSubsidiaryAttrs,
        });
        await factory.create(FN.partnerSubsidiaryPaymentMethod, {
            partnerSubsidiaryId: partnerSubsidiaryFactory.id,
            ...partnerSubsidiaryPaymentMethodAttrs,
        });
        await factory.create(FN.partnerSubsidiaryStore, {
            partnerSubsidiaryId: partnerSubsidiaryFactory.id,
            storeId: storeFactory.id,
            ...partnerSubsidiaryStoreAttrs,
        });
        const {
            partnerSubsidiary: {
                paymentMethods: [partnerSubsidiaryPaymentMethod],
                partnerEntity,
                ...partnerSubsidiary
            },
            ...partnerSubsidiaryStore
        } = await PartnerSubsidiaryStore.query()
            .findOne({ storeId: store.id })
            .withGraphFetched('partnerSubsidiary.[paymentMethods, partnerEntity]');
        optionalEntities = {
            partnerEntity,
            partnerSubsidiary,
            partnerSubsidiaryPaymentMethod,
            partnerSubsidiaryStore,
        };
    }

    return {
        user,
        laundromatBusiness,
        businessTheme,
        businessSettings,
        store,
        storeTheme,
        storeSettings,
        centsCustomer,
        centsCustomerAddress,
        businessCustomer,
        storeCustomer,
        serviceOrder,
        order,
        businessPromotionPrograms: createBusinessPromotionPrograms ? promotionPrograms[0] : null,
        ...optionalEntities,
    };
};

module.exports = exports = { createUserWithBusinessAndCustomerOrders };
