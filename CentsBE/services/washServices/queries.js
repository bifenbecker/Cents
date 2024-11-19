const { raw } = require('objection');
const { groupBy, map, uniq } = require('lodash');

const Store = require('../../models/store');
const PricingTier = require('../../models/pricingTier');
const Service = require('../../models/services');
const ServicePrice = require('../../models/servicePrices');
const ServiceCategory = require('../../models/serviceCategories');
const ServiceOrderItem = require('../../models/serviceOrderItem');
const Modifier = require('../../models/modifiers');
const ServiceOrder = require('../../models/serviceOrders');
const BusinessSettings = require('../../models/businessSettings');
const { mapCustomerSelectionForServices, mapServicesAndProducts } = require('./responseMappers');
const { getProductsQuery } = require('../queries/getProductsQuery');
const BusinessCustomerQuery = require('../../queryHelpers/businessCustomerQuery');
const { serviceCategoryTypes } = require('../../constants/constants');

async function getServicePrices(transaction, storeId, businessId, tierId) {
    const servicesQuery = transaction
        ? ServiceCategory.query(transaction)
        : ServiceCategory.query();

    let services = servicesQuery
        .select(
            `${ServiceCategory.tableName}.id`,
            'category',
            'serviceCategoryType.type as categoryType',
            'services:pricingStructure.type as pricingStructureType',
        )
        .withGraphJoined(
            '[services(serviceFilter).[pricingStructure, prices(pricesFilter)], serviceCategoryType]',
        )
        .modifiers({
            serviceFilter: (query) => {
                query
                    .select(
                        'id',
                        'serviceCategoryId',
                        'name',
                        'defaultPrice',
                        'hasMinPrice',
                        'description',
                        'minPrice',
                        'minQty',
                        'isDeleted',
                    )
                    .where('deletedAt', null);
            },
            pricesFilter: (query) => {
                query
                    .select(
                        'id',
                        'storeId',
                        'pricingTierId',
                        'serviceId',
                        'storePrice',
                        'minQty',
                        'minPrice',
                        'isFeatured',
                        'isDeliverable',
                        'isTaxable',
                    )
                    .andWhere('deletedAt', null);
            },
        })
        .where('serviceCategories.deletedAt', null)
        .whereNot('serviceCategories.category', 'DELIVERY')
        .andWhere('services.isDeleted', false)
        .orderByRaw('"serviceCategories".category desc, "services:name" asc');

    if (tierId) {
        services = services.andWhere('services:prices.pricingTierId', tierId);
    } else if (businessId) {
        services = services.andWhere('serviceCategories.businessId', businessId);
    } else {
        services = services.andWhere('services:prices.storeId', storeId);
    }
    services = await services;
    return services;
}

async function getServices(businessId, offset, archived) {
    let servicesMaster = ServiceCategory.query()
        .select(
            'serviceCategories.id as categoryId',
            'serviceCategories.category',
            'servicesMaster.*',
            raw(`
                    count("servicesMaster".id) over() as "totalRecords",
                    array_agg(distinct(coalesce("servicePrices"."storePrice", 0))) as prices
                    `),
        )
        .leftJoin('servicesMaster', 'servicesMaster.serviceCategoryId', 'serviceCategories.id')
        .leftJoin(
            raw('(select * from "servicePrices" where "deletedAt" is null) as "servicePrices"'),
            'servicePrices.serviceId',
            'servicesMaster.id',
        )
        .where({
            'serviceCategories.deletedAt': null,
            'servicePrices.deletedAt': null,
            'serviceCategories.businessId': businessId,
        });

    if (archived !== 'true') {
        servicesMaster = servicesMaster.andWhere({
            'servicesMaster.isDeleted': false,
            'servicesMaster.deletedAt': null,
        });
    }
    servicesMaster = servicesMaster
        .whereNot('serviceCategories.category', 'DELIVERY')
        .groupBy('serviceCategories.id', 'servicesMaster.id')
        .orderBy('serviceCategories.category', 'desc');
    servicesMaster = offset
        ? servicesMaster.limit(20).offset((Number(offset) - 1) * 20)
        : servicesMaster;
    servicesMaster = await servicesMaster;
    return servicesMaster;
}

async function getSingleServiceDetails(id) {
    const service = await Service.query()
        .withGraphJoined(
            '[pricingStructure, prices(priceFilter).[store(storeName)], serviceCategory]',
        )
        .modifiers({
            storeName: (query) => {
                query.select('name');
            },
            priceFilter: (query) => {
                query.where('deletedAt', null).whereNot({
                    storeId: null,
                });
            },
        })
        .where({
            'servicesMaster.id': id,
        })
        .orderBy('prices:store.name', 'asc')
        .first();
    return service;
}

async function getCustomerSelectionServices(orderId, category) {
    const services = await ServicePrice.query()
        .select(
            'servicePrices.id as priceId',
            raw('coalesce("servicePrices"."storePrice", 0) as price'),
            'servicePrices.storeId as storeId',
            'servicesMaster.name as lineItemName',
            'servicesMaster.hasMinPrice',
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
            ),
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
            ),
            'servicePrices.isTaxable as isTaxable',
            'servicesMaster.description as description',
            'serviceCategories.category as category',
            raw('\'SERVICE\' as "lineItemType", true as "customerSelection"'),
            'servicesMaster.id as serviceId',
            'servicesMaster.isDeleted as isDeleted',
            'servicePricingStructure.type as pricingType',
        )
        .from(`${ServiceOrderItem.tableName}`)
        .join('serviceReferenceItems', (builder) => {
            builder
                .on('serviceOrderItems.id', '=', 'serviceReferenceItems.orderItemId')
                .andOn('serviceOrderItems.orderId', Number(orderId));
        })
        .join('servicePrices', 'servicePrices.id', 'serviceReferenceItems.servicePriceId')
        .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .join(
            'servicePricingStructure',
            'servicePricingStructure.id',
            'servicesMaster.servicePricingStructureId',
        )
        .where('serviceCategories.category', category || 'FIXED_PRICE')
        .andWhere('customerSelection', true)
        .orderBy('lineItemName', 'asc');
    return services;
}

/**
 * Get the customer service selections for category type
 *
 * @param {Number} orderId
 * @param {*} typ
 */
async function getCustomerServiceSelectionsForCategoryType(orderId, type) {
    const services = await ServicePrice.query()
        .select(
            'servicePrices.id as priceId',
            raw('coalesce("servicePrices"."storePrice", 0) as price'),
            'servicePrices.storeId as storeId',
            'servicesMaster.name as lineItemName',
            'servicesMaster.hasMinPrice',
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
            ),
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
            ),
            'servicePrices.isTaxable as isTaxable',
            'servicesMaster.description as description',
            'serviceCategories.category as category',
            'serviceCategories.id as serviceCategoryId',
            'serviceCategories.turnAroundInHours as turnAroundInHours',
            raw('\'SERVICE\' as "lineItemType", true as "customerSelection"'),
            'servicesMaster.id as serviceId',
            'servicePricingStructure.id as pricingStructureId',
            'servicePricingStructure.type as pricingStructureType',
            'serviceCategoryTypes.type as serviceCategoryType',
            'serviceCategoryTypes.id as serviceCategoryTypeId',
        )
        .from(`${ServiceOrderItem.tableName}`)
        .join('serviceReferenceItems', (builder) => {
            builder
                .on('serviceOrderItems.id', '=', 'serviceReferenceItems.orderItemId')
                .andOn('serviceOrderItems.orderId', Number(orderId));
        })
        .join('servicePrices', 'servicePrices.id', 'serviceReferenceItems.servicePriceId')
        .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .join(
            'servicePricingStructure',
            'servicePricingStructure.id',
            'servicesMaster.servicePricingStructureId',
        )
        .join(
            'serviceCategoryTypes',
            'serviceCategoryTypes.id',
            'serviceCategories.serviceCategoryTypeId',
        )
        .where('serviceCategoryTypes.type', type)
        .andWhere('customerSelection', true)
        .orderBy('lineItemName', 'asc');
    return services;
}

async function getLaundryServicesEmployeeApp(store, category, orderId, centsCustomerId) {
    const { id, businessId } = store;
    let queryColumn = 'storeId';
    let queryValue = id;

    if (orderId) {
        const serviceOrder = await ServiceOrder.query().findById(orderId);
        if (serviceOrder.tierId) {
            queryColumn = 'pricingTierId';
            queryValue = serviceOrder.tierId;
        } else {
            queryValue = serviceOrder.storeId;
        }
    } else if (centsCustomerId) {
        const businessCustomerQuery = new BusinessCustomerQuery(centsCustomerId, businessId);
        const businessCustomerDetails = await businessCustomerQuery.getCommercialCustomer();
        if (businessCustomerDetails && businessCustomerDetails.commercialTierId) {
            queryColumn = 'pricingTierId';
            queryValue = businessCustomerDetails.commercialTierId;
        }
    }

    let laundryPrice = ServicePrice.query()
        .select(
            'servicePrices.id as priceId',
            raw('coalesce("servicePrices"."storePrice", 0) as price'),
            'servicePrices.storeId as storeId',
            'servicesMaster.name as lineItemName',
            'servicesMaster.hasMinPrice',
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
            ),
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
            ),
            'servicePrices.isTaxable as isTaxable',
            'servicesMaster.description as description',
            'serviceCategories.category as category',
            raw('\'SERVICE\' as "lineItemType", false as "customerSelection"'),
            'servicesMaster.id as serviceId',
            'servicePricingStructure.type as pricingType',
        )
        .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .join(
            'servicePricingStructure',
            'servicePricingStructure.id',
            'servicesMaster.servicePricingStructureId',
        )
        .andWhere('serviceCategories.businessId', businessId)
        .andWhere('servicesMaster.isDeleted', false);
    laundryPrice = category
        ? laundryPrice.where('serviceCategories.category', category)
        : laundryPrice.where('serviceCategories.category', 'FIXED_PRICE');
    laundryPrice = laundryPrice.where((query) => {
        query
            .where('servicePrices.isFeatured', true)
            .andWhere('servicePrices.deletedAt', null)
            .andWhere('servicesMaster.deletedAt', null);
    });
    laundryPrice = laundryPrice.where(queryColumn, queryValue);
    laundryPrice = Number(orderId)
        ? laundryPrice.select('servicesMaster.isDeleted as isArchived').union((query) => {
              query
                  .select(
                      'servicePrices.id as priceId',
                      raw('coalesce("servicePrices"."storePrice", 0) as price'),
                      'servicePrices.storeId as storeId',
                      'servicesMaster.name as lineItemName',
                      'servicesMaster.hasMinPrice',
                      raw(
                          'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
                      ),
                      raw(
                          'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
                      ),
                      'servicePrices.isTaxable as isTaxable',
                      'servicesMaster.description as description',
                      'serviceCategories.category as category',
                      raw('\'SERVICE\' as "lineItemType", false as "customerSelection"'),
                      'servicesMaster.id as serviceId',
                      'servicePricingStructure.type as pricingType',
                      'servicesMaster.isDeleted as isArchived',
                  )
                  .from(`${ServiceOrderItem.tableName}`)
                  .join('serviceReferenceItems', (builder) => {
                      builder
                          .on('serviceOrderItems.id', '=', 'serviceReferenceItems.orderItemId')
                          .andOn('serviceOrderItems.orderId', Number(orderId))
                          .onNull('serviceOrderItems.deletedAt');
                  })
                  .join('servicePrices', 'servicePrices.id', 'serviceReferenceItems.servicePriceId')
                  .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
                  .join(
                      'serviceCategories',
                      'serviceCategories.id',
                      'servicesMaster.serviceCategoryId',
                  )
                  .join(
                      'servicePricingStructure',
                      'servicePricingStructure.id',
                      'servicesMaster.servicePricingStructureId',
                  )
                  .where('serviceCategories.category', category || 'FIXED_PRICE');
          })
        : laundryPrice;
    laundryPrice = await laundryPrice.orderBy('lineItemName', 'asc');
    if (orderId) {
        const customerSelectionServices = await getCustomerSelectionServices(orderId, category);
        return mapCustomerSelectionForServices(laundryPrice, customerSelectionServices);
    }
    return laundryPrice;
}

/**
 * Get a list of all laundry services by category for a given store in the employee app
 *
 * @param {Object} store
 * @param {Number} orderId
 * @param {Number} centsCustomerId
 */
async function getLaundryServicesByCategory(store, orderId, centsCustomerId) {
    const { id, businessId } = store;
    let queryColumn = 'storeId';
    let queryValue = id;

    if (orderId) {
        const serviceOrder = await ServiceOrder.query().findById(orderId);
        if (serviceOrder.tierId) {
            queryColumn = 'pricingTierId';
            queryValue = serviceOrder.tierId;
        } else {
            queryValue = serviceOrder.storeId;
        }
    } else if (centsCustomerId) {
        const businessCustomerQuery = new BusinessCustomerQuery(centsCustomerId, businessId);
        const businessCustomerDetails = await businessCustomerQuery.getCommercialCustomer();
        if (businessCustomerDetails && businessCustomerDetails.commercialTierId) {
            queryColumn = 'pricingTierId';
            queryValue = businessCustomerDetails.commercialTierId;
        }
    }

    let laundryPrice = ServicePrice.query()
        .select(
            'servicePrices.id as priceId',
            raw('coalesce("servicePrices"."storePrice", 0) as price'),
            'servicePrices.storeId as storeId',
            'servicesMaster.name as lineItemName',
            'servicesMaster.hasMinPrice',
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
            ),
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
            ),
            'servicePrices.isTaxable as isTaxable',
            'servicesMaster.description as description',
            'serviceCategories.category as category',
            'serviceCategories.id as serviceCategoryId',
            'serviceCategories.turnAroundInHours as turnAroundInHours',
            raw('\'SERVICE\' as "lineItemType", false as "customerSelection"'),
            'servicesMaster.id as serviceId',
            'servicePricingStructure.id as pricingStructureId',
            'servicePricingStructure.type as pricingStructureType',
            'serviceCategoryTypes.type as serviceCategoryType',
            'serviceCategoryTypes.id as serviceCategoryTypeId',
        )
        .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .join(
            'servicePricingStructure',
            'servicePricingStructure.id',
            'servicesMaster.servicePricingStructureId',
        )
        .join(
            'serviceCategoryTypes',
            'serviceCategoryTypes.id',
            'serviceCategories.serviceCategoryTypeId',
        )
        .whereNot('serviceCategories.category', 'DELIVERY')
        .andWhere('serviceCategories.businessId', businessId)
        .andWhere('servicesMaster.isDeleted', false)
        .andWhere('serviceCategoryTypes.type', serviceCategoryTypes.LAUNDRY);
    laundryPrice = laundryPrice.where((query) => {
        query
            .where('servicePrices.isFeatured', true)
            .andWhere('servicePrices.deletedAt', null)
            .andWhere('servicesMaster.deletedAt', null);
    });
    laundryPrice = laundryPrice.where(queryColumn, queryValue);

    if (Number(orderId)) {
        laundryPrice = laundryPrice
            .select('servicesMaster.isDeleted as isDeleted')
            .union((query) => {
                query
                    .select(
                        'servicePrices.id as priceId',
                        raw('coalesce("servicePrices"."storePrice", 0) as price'),
                        'servicePrices.storeId as storeId',
                        'servicesMaster.name as lineItemName',
                        'servicesMaster.hasMinPrice',
                        raw(
                            'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
                        ),
                        raw(
                            'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
                        ),
                        'servicePrices.isTaxable as isTaxable',
                        'servicesMaster.description as description',
                        'serviceCategories.category as category',
                        'serviceCategories.id as serviceCategoryId',
                        'serviceCategories.turnAroundInHours as turnAroundInHours',
                        raw('\'SERVICE\' as "lineItemType", false as "customerSelection"'),
                        'servicesMaster.id as serviceId',
                        'servicePricingStructure.id as pricingStructureId',
                        'servicePricingStructure.type as pricingStructureType',
                        'serviceCategoryTypes.type as serviceCategoryType',
                        'serviceCategoryTypes.id as serviceCategoryTypeId',
                        'servicesMaster.isDeleted as isDeleted',
                    )
                    .from(`${ServiceOrderItem.tableName}`)
                    .join('serviceReferenceItems', (builder) => {
                        builder
                            .on('serviceOrderItems.id', '=', 'serviceReferenceItems.orderItemId')
                            .andOn('serviceOrderItems.orderId', Number(orderId))
                            .onNull('serviceOrderItems.deletedAt');
                    })
                    .join(
                        'servicePrices',
                        'servicePrices.id',
                        'serviceReferenceItems.servicePriceId',
                    )
                    .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
                    .join(
                        'serviceCategories',
                        'serviceCategories.id',
                        'servicesMaster.serviceCategoryId',
                    )
                    .join(
                        'servicePricingStructure',
                        'servicePricingStructure.id',
                        'servicesMaster.servicePricingStructureId',
                    )
                    .join(
                        'serviceCategoryTypes',
                        'serviceCategoryTypes.id',
                        'serviceCategories.serviceCategoryTypeId',
                    )
                    .andWhere('serviceCategoryTypes.type', serviceCategoryTypes.LAUNDRY);
            });
    }
    laundryPrice = await laundryPrice.orderBy('lineItemName', 'asc');
    if (orderId) {
        const customerSelectionServices = await getCustomerServiceSelectionsForCategoryType(
            orderId,
            serviceCategoryTypes.LAUNDRY,
        );
        const mappedResponse = mapCustomerSelectionForServices(
            laundryPrice,
            customerSelectionServices,
        );
        let categories = map(mappedResponse, 'category');
        categories = uniq(categories);
        categories.unshift('All');
        return [mappedResponse, categories];
    }
    const laundryItems = laundryPrice;
    let categories = map(laundryPrice, 'category');
    categories = uniq(categories);
    categories.unshift('All');

    laundryPrice = groupBy(laundryPrice, (b) => b.category);
    return [laundryItems, categories];
}

/**
 * Get a list of all dry cleaning services by category for a given store in the employee app
 *
 * @param {Object} store
 * @param {Number} orderId
 * @param {Number} centsCustomerId
 */
async function getDryCleaningServicesByCategory(store, orderId, centsCustomerId) {
    const { id, businessId } = store;
    let queryColumn = 'storeId';
    let queryValue = id;

    if (orderId) {
        const serviceOrder = await ServiceOrder.query().findById(orderId);
        if (serviceOrder.tierId) {
            queryColumn = 'pricingTierId';
            queryValue = serviceOrder.tierId;
        } else {
            queryValue = serviceOrder.storeId;
        }
    } else if (centsCustomerId) {
        const businessCustomerQuery = new BusinessCustomerQuery(centsCustomerId, businessId);
        const businessCustomerDetails = await businessCustomerQuery.getCommercialCustomer();
        if (businessCustomerDetails && businessCustomerDetails.commercialTierId) {
            queryColumn = 'pricingTierId';
            queryValue = businessCustomerDetails.commercialTierId;
        }
    }

    let dryCleaningPrice = ServicePrice.query()
        .select(
            'servicePrices.id as priceId',
            raw('coalesce("servicePrices"."storePrice", 0) as price'),
            'servicePrices.storeId as storeId',
            'servicesMaster.name as lineItemName',
            'servicesMaster.hasMinPrice',
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
            ),
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
            ),
            'servicePrices.isTaxable as isTaxable',
            'servicesMaster.description as description',
            'serviceCategories.category as category',
            'serviceCategories.id as serviceCategoryId',
            'serviceCategories.turnAroundInHours as turnAroundInHours',
            raw('\'SERVICE\' as "lineItemType", false as "customerSelection"'),
            'servicesMaster.id as serviceId',
            'servicePricingStructure.id as pricingStructureId',
            'servicePricingStructure.type as pricingStructureType',
            'serviceCategoryTypes.type as serviceCategoryType',
            'serviceCategoryTypes.id as serviceCategoryTypeId',
        )
        .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .join(
            'servicePricingStructure',
            'servicePricingStructure.id',
            'servicesMaster.servicePricingStructureId',
        )
        .join(
            'serviceCategoryTypes',
            'serviceCategoryTypes.id',
            'serviceCategories.serviceCategoryTypeId',
        )
        .whereNot('serviceCategories.category', 'DELIVERY')
        .andWhere('serviceCategories.businessId', businessId)
        .andWhere('servicesMaster.isDeleted', false)
        .andWhere('serviceCategoryTypes.type', serviceCategoryTypes.DRY_CLEANING);
    dryCleaningPrice = dryCleaningPrice.where((query) => {
        query
            .where('servicePrices.isFeatured', true)
            .andWhere('servicePrices.deletedAt', null)
            .andWhere('servicesMaster.deletedAt', null);
    });
    dryCleaningPrice = dryCleaningPrice.where(queryColumn, queryValue);

    if (Number(orderId)) {
        dryCleaningPrice = dryCleaningPrice
            .select('servicesMaster.isDeleted as isDeleted')
            .union((query) => {
                query
                    .select(
                        'servicePrices.id as priceId',
                        raw('coalesce("servicePrices"."storePrice", 0) as price'),
                        'servicePrices.storeId as storeId',
                        'servicesMaster.name as lineItemName',
                        'servicesMaster.hasMinPrice',
                        raw(
                            'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
                        ),
                        raw(
                            'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
                        ),
                        'servicePrices.isTaxable as isTaxable',
                        'servicesMaster.description as description',
                        'serviceCategories.category as category',
                        'serviceCategories.id as serviceCategoryId',
                        'serviceCategories.turnAroundInHours as turnAroundInHours',
                        raw('\'SERVICE\' as "lineItemType", false as "customerSelection"'),
                        'servicesMaster.id as serviceId',
                        'servicePricingStructure.id as pricingStructureId',
                        'servicePricingStructure.type as pricingStructureType',
                        'serviceCategoryTypes.type as serviceCategoryType',
                        'serviceCategoryTypes.id as serviceCategoryTypeId',
                        'servicesMaster.isDeleted as isDeleted',
                    )
                    .from(`${ServiceOrderItem.tableName}`)
                    .join('serviceReferenceItems', (builder) => {
                        builder
                            .on('serviceOrderItems.id', '=', 'serviceReferenceItems.orderItemId')
                            .andOn('serviceOrderItems.orderId', Number(orderId))
                            .onNull('serviceOrderItems.deletedAt');
                    })
                    .join(
                        'servicePrices',
                        'servicePrices.id',
                        'serviceReferenceItems.servicePriceId',
                    )
                    .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
                    .join(
                        'serviceCategories',
                        'serviceCategories.id',
                        'servicesMaster.serviceCategoryId',
                    )
                    .join(
                        'servicePricingStructure',
                        'servicePricingStructure.id',
                        'servicesMaster.servicePricingStructureId',
                    )
                    .join(
                        'serviceCategoryTypes',
                        'serviceCategoryTypes.id',
                        'serviceCategories.serviceCategoryTypeId',
                    )
                    .andWhere('serviceCategoryTypes.type', serviceCategoryTypes.DRY_CLEANING);
            });
    }

    dryCleaningPrice = await dryCleaningPrice.orderBy('lineItemName', 'asc');
    if (orderId) {
        const customerSelectionServices = await getCustomerServiceSelectionsForCategoryType(
            orderId,
            serviceCategoryTypes.DRY_CLEANING,
        );
        const mappedResponse = mapCustomerSelectionForServices(
            dryCleaningPrice,
            customerSelectionServices,
        );
        let categories = map(mappedResponse, 'category');
        categories = uniq(categories);
        categories.unshift('All');
        return [mappedResponse, categories];
    }
    const dryCleaningItems = dryCleaningPrice;
    let categories = map(dryCleaningPrice, 'category');
    categories = uniq(categories);
    categories.unshift('All');

    dryCleaningPrice = groupBy(dryCleaningPrice, (b) => b.category);
    return [dryCleaningItems, categories];
}

async function getStoreServicesInline(storeId, tierId, transaction, version) {
    let businessId = null;

    if (storeId) {
        const store = await Store.query(transaction).findById(storeId);
        businessId = store?.businessId;
    }
    if (tierId) {
        const tier = await PricingTier.query(transaction).findById(tierId);
        businessId = tier?.businessId;
    }

    const businessSettings = await BusinessSettings.query().findOne({ businessId });
    const cents20LdFlag = !!businessSettings?.dryCleaningEnabled;

    let services = ServicePrice.query(transaction)
        .select(
            'servicePrices.*',
            'serviceCategories.category as category',
            'servicesMaster.name as serviceName',
            'servicesMaster.hasMinPrice as hasMinPrice',
            'servicePricingStructure.type as pricingType',
            'serviceCategoryTypes.type as serviceCategoryType',
        )
        .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .join(
            'serviceCategoryTypes',
            'serviceCategoryTypes.id',
            'serviceCategories.serviceCategoryTypeId',
        )
        .join(
            'servicePricingStructure',
            'servicePricingStructure.id',
            'servicesMaster.servicePricingStructureId',
        );

    // if tierId is present then prices will be returned based on PricingTier
    services = tierId
        ? services.where('servicePrices.pricingTierId', tierId)
        : services.where('servicePrices.storeId', storeId);

    if (version >= '2.0.0' && cents20LdFlag) {
        services.where({
            'servicePrices.deletedAt': null,
            'servicePrices.isFeatured': true,
        });
    } else {
        services
            .where({
                'servicePrices.deletedAt': null,
                'servicePrices.isFeatured': true,
            })
            .whereIn('serviceCategories.category', ['PER_POUND', 'FIXED_PRICE']);
    }
    services = await services;
    return services;
}

async function getServicePriceDetails(servicePriceId, transaction) {
    const details = await ServicePrice.query(transaction)
        .select(
            'servicePrices.id as priceId',
            raw('coalesce("servicePrices"."storePrice", 0) as price'),
            'servicePrices.storeId as storeId',
            'servicesMaster.name as lineItemName',
            'servicesMaster.hasMinPrice',
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
            ),
            raw(
                'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
            ),
            'servicePrices.isTaxable as isTaxable',
            'servicesMaster.description as description',
            'serviceCategories.category as category',
            raw('\'SERVICE\' as "lineItemType"'),
            'servicesMaster.id as serviceId',
            raw('0 as weight, 1 as count'),
            'servicePrices.isDeliverable',
            'servicePrices.pricingTierId',
            'servicePricingStructure.type as servicePricingStructureType',
            'serviceCategoryTypes.type as serviceCategoryType',
        )
        .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .join(
            'servicePricingStructure',
            'servicePricingStructure.id',
            'servicesMaster.servicePricingStructureId',
        )
        .join(
            'serviceCategoryTypes',
            'serviceCategoryTypes.id',
            'serviceCategories.serviceCategoryTypeId',
        )
        .where({
            'servicePrices.id': servicePriceId,
            'servicePrices.isFeatured': true,
            'servicePrices.deletedAt': null,
        })
        .first();
    return details;
}

async function findDeliveryServiceByName(name, storeId, transaction) {
    const service = await Service.query(transaction)
        .select(
            'servicesMaster.name',
            'servicesMaster.description',
            'servicePrices.id as servicePriceId',
        )
        .join('servicePrices', 'servicePrices.serviceId', 'servicesMaster.id')
        .where({
            'servicesMaster.name': name,
            'servicePrices.storeId': storeId,
        })
        .first();
    return service;
}

async function getModifiers(businessId, transaction) {
    const modifiers = await Modifier.query(transaction)
        .select(
            'modifiers.id',
            'name',
            'price',
            'serviceModifiers.isFeatured as isFeatured',
            'serviceModifiers.serviceId as serviceId',
            'serviceModifiers.id as serviceModifierId',
        )
        .join('serviceModifiers', 'serviceModifiers.modifierId', 'modifiers.id')
        .where({
            'modifiers.businessId': businessId,
        });
    return modifiers;
}

async function getServicePricesAndProducts(id) {
    return mapServicesAndProducts(
        await getProductsQuery(null, null, id, null, false),
        await getServicePrices(null, null, id),
    );
}
module.exports = exports = {
    getServices,
    getServicePrices,
    getStoreServicesInline,
    getServicePriceDetails,
    getSingleServiceDetails,
    findDeliveryServiceByName,
    getLaundryServicesEmployeeApp,
    getModifiers,
    getServicePricesAndProducts,
    getLaundryServicesByCategory,
    getDryCleaningServicesByCategory,
};
