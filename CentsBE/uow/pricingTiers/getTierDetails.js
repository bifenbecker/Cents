const { map } = require('lodash');
const PricingTier = require('../../models/pricingTier');
const { pricingTiersTypes } = require('../../constants/constants');

const getTierDetails = async (payload) => {
    const { id, transaction } = payload;
    const newPayload = payload;
    const tierData = await PricingTier.query(transaction)
        .select(
            'pricingTiers.name',
            'pricingTiers.type',
            'pricingTiers.commercialDeliveryFeeInCents',
            'pricingTiers.commercialDeliveryFeeInCents',
            'pricingTiers.offerDryCleaningForDeliveryTier',
        )
        .withGraphJoined(
            `[businessCustomers(businessCustomerFilter).[centsCustomer(centsCustomerFilter)],
             storeSettings.[store(storeFilter)], zones.[ownDeliverySettings.[store(storeFilter)]], servicePrices(priceFilter).[service(serviceFilter).[serviceCategory(serviceCategoryFilter)]]]`,
        )
        .modifiers({
            businessCustomerFilter: (query) => {
                query.select('centsCustomerId').where({
                    isCommercial: true,
                    deletedAt: null,
                });
            },
            centsCustomerFilter: (query) => {
                query.select('firstName', 'lastName', 'phoneNumber');
            },
            storeFilter: (query) => {
                query.select('name', 'id');
            },
            priceFilter: (query) => {
                query.select('storePrice', 'minQty', 'minPrice', 'isTaxable').where({
                    isDeliverable: true,
                    deletedAt: null,
                });
            },
            serviceFilter: (query) => {
                query.select('id', 'name', 'hasMinPrice').where({
                    isDeleted: false,
                    deletedAt: null,
                });
            },
            serviceCategoryFilter: (query) => {
                query.select('category').where('deletedAt', null);
            },
        })
        .where('pricingTiers.id', id).orderByRaw(`"businessCustomers:centsCustomer"."firstName" asc,
            "businessCustomers:centsCustomer"."lastName" asc,
            "storeSettings:store"."name" asc`);

    const tier = {};

    if (!tierData.length) {
        newPayload.tier = tier;
        return newPayload;
    }
    const tierDetails = tierData[0];

    tier.name = tierDetails.name;
    tier.type = tierDetails.type;
    tier.commercialDeliveryFeeInCents = tierDetails.commercialDeliveryFeeInCents;
    tier.offerDryCleaningForDeliveryTier = tierDetails.offerDryCleaningForDeliveryTier;

    if (tierDetails.type === pricingTiersTypes.COMMERCIAL) {
        tier.customers = map(tierDetails.businessCustomers, (data) => ({
            id: data.centsCustomerId,
            phoneNumber: data.centsCustomer.phoneNumber,
            name: data.centsCustomer.fullName(),
        }));
    } else if (tierDetails.type === pricingTiersTypes.DELIVERY) {
        tier.locations = map(tierDetails.storeSettings, (data) => ({
            id: data.store.id,
            name: data.store.name,
        }));
        tier.locations = tier.locations.concat(
            map(tierDetails.zones, (zone) => ({
                id: zone.ownDeliverySettings.store.id,
                name: zone.ownDeliverySettings.store.name,
            })),
        );
    }

    if (tierDetails.servicePrices) {
        tier.deliverableServicePrices = map(
            tierDetails.servicePrices.filter((ele) => ele.service),
            (price) => ({
                category: price.service.serviceCategory.category,
                serviceId: price.service.id,
                name: price.service.name,
                storePrice: price.storePrice,
                minQty: price.minQty,
                hasMinPrice: price.service.hasMinPrice,
                minPrice: price.minPrice,
                isTaxable: price.isTaxable,
            }),
        );
    }

    newPayload.tier = tier;
    return newPayload;
};
module.exports = exports = getTierDetails;
