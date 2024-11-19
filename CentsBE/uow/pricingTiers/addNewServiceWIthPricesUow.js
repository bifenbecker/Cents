const { groupBy, forEach, find, orderBy, map, forIn } = require('lodash');
const ServiceCategory = require('../../models/serviceCategories');

const getPrices = (tierId, serviceId) => [
    {
        id: null,
        storeId: null,
        pricingTierId: Number(tierId),
        serviceId,
        storePrice: 0,
        minQty: 0,
        minPrice: 0,
        isFeatured: false,
        isDeliverable: false,
        isTaxable: false,
    },
];

const getMappedService = (id, rawData) => {
    if (!rawData.rows.length) return [];
    const services = [];
    const groupedServices = groupBy(rawData.rows, 'category');
    forIn(groupedServices, (category, key) => {
        services.push({
            id: category[0].id,
            category: key,
            services: map(category, (service) => ({
                id: service.serviceId,
                serviceCategoryId: service.serviceCategoryId,
                name: service.serviceName,
                defaultPrice: service.defaultPrice,
                hasMinPrice: service.hasMinPrice,
                description: service.description,
                minPrice: service.minPrice,
                minQty: service.minQty,
                isDeleted: service.isDeleted,
                prices: getPrices(id, service.serviceId),
            })),
            categoryType: category[0]?.categoryType,
            pricingStructureType: category[0]?.pricingStructureType,
        });
    });
    return services;
};

const addNewServiceWIthPrices = async (payload) => {
    const newPayload = payload;
    const { id, transaction, businessId } = newPayload;

    let services = await ServiceCategory.query(transaction).knex()
        .raw(`SELECT "serviceCategories"."id", "category", "services"."id" AS "serviceId",
    "services"."serviceCategoryId" AS "serviceCategoryId", "services"."name" AS "serviceName",
    "services"."defaultPrice" AS "defaultPrice", "services"."hasMinPrice" AS "hasMinPrice",
    "services"."description" AS "description", "services"."minPrice" AS "minPrice",
    "services"."minQty" AS "minQty", "services"."isDeleted" AS "isDeleted",
    "serviceCategoryTypes"."type" AS "categoryType", 
    "servicePricingStructure"."type" AS "pricingStructureType"
    FROM "serviceCategories"
        INNER JOIN "servicesMaster" services ON "services"."serviceCategoryId" = "serviceCategories"."id"
        LEFT OUTER JOIN "servicePrices" ON "servicePrices"."serviceId" = "services".id AND "servicePrices"."storeId" IS NULL AND "servicePrices"."pricingTierId" = ${id}
        LEFT JOIN "serviceCategoryTypes" ON "serviceCategoryTypes"."id" = "serviceCategories"."serviceCategoryTypeId"
        LEFT JOIN "servicePricingStructure" ON "servicePricingStructure"."id" = "services"."servicePricingStructureId"
    WHERE "services"."deletedAt" IS NULL 
    AND "serviceCategories"."deletedAt" is null 
    AND "servicePrices".id IS NULL 
    AND "serviceCategories"."businessId" = ${businessId}
    AND "services"."isDeleted" = false 
    AND "serviceCategories"."category" <> 'DELIVERY' 
    ORDER BY "serviceCategories".category DESC, "serviceName" ASC`);

    services = getMappedService(id, services);

    forEach(services, (categories) => {
        const existingCategory = find(newPayload.services, { category: categories.category });
        if (existingCategory) {
            existingCategory.services.push(...categories.services);
            existingCategory.services = orderBy(existingCategory.services, ['name'], ['asc']);
        } else {
            newPayload.services.push(categories);
        }
    });
    return newPayload;
};

module.exports = exports = addNewServiceWIthPrices;
