const { transaction, raw } = require('objection');

const StoreCustomer = require('../../../../models/storeCustomer');
const BusinessPromotionProgram = require('../../../../models/businessPromotionProgram');

const getBusiness = require('../../../../utils/getBusiness');
const { mapStoreData } = require('./helpers/storePromotionPrograms');
const { mapLightrailRules, getDiscountValue } = require('./helpers/lightrail');
const { addBusinessIdToProgramItems } = require('./helpers/promotionProgramItems');

/**
 * Retrieve a list of all promotion programs for a given business
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function getAllPromotionsForBusiness(req, res, next) {
    try {
        const business = await getBusiness(req);
        const promotionPrograms = await BusinessPromotionProgram.query()
            .withGraphJoined('[storePromotions, promotionItems]')
            .where({
                'businessPromotionPrograms.businessId': business.id,
            });
        res.status(200).json({
            success: true,
            promotionPrograms,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Based on the request, format the data appropriately and return the proper JSON structure
 *
 * @param {*} req
 */
async function mapPromotion(req) {
    const promotionProgram = {};

    const {
        locationsSelected,
        locationEligibilityType,
        promotionProgramItems,
        name,
        promotionType,
        customerRedemptionLimit,
        startDate,
        endDate,
        discountValue,
        appliesToType,
        requirementType,
        requirementValue,
        activeDays,
    } = req.body;

    const business = await getBusiness(req);
    const storeData = await mapStoreData(locationsSelected, business.id, locationEligibilityType);
    const minRequirements = {
        requirementType,
        requirementValue,
    };

    [promotionProgram.balanceRule, promotionProgram.redemptionRule] = await mapLightrailRules(
        getDiscountValue(discountValue),
        promotionType,
        minRequirements,
    );

    promotionProgram.businessId = business.id;
    promotionProgram.name = name;
    promotionProgram.promotionType = promotionType;
    promotionProgram.appliesToType = appliesToType;
    promotionProgram.currency = 'USD';
    promotionProgram.discountValue = getDiscountValue(discountValue);
    // TODO: integrate with Lightrail
    promotionProgram.lightrailId = null;
    promotionProgram.locationEligibilityType = locationEligibilityType;
    promotionProgram.pretax = true;
    promotionProgram.active = true;
    promotionProgram.customerRedemptionLimit = customerRedemptionLimit;
    promotionProgram.startDate = startDate;
    promotionProgram.endDate = endDate;
    promotionProgram.storePromotions = storeData;
    promotionProgram.promotionItems = promotionProgramItems
        ? await addBusinessIdToProgramItems(promotionProgramItems, business.id)
        : [];
    promotionProgram.activeDays = JSON.stringify(activeDays);
    promotionProgram.requirementType = requirementType;
    promotionProgram.requirementValue = requirementValue;

    return promotionProgram;
}

/**
 * Create a promotion for a given business
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function createPromotion(req, res, next) {
    let trx = null;
    try {
        const mappedPromotion = await mapPromotion(req);

        trx = await transaction.start(BusinessPromotionProgram.knex());

        const promotionProgram = await BusinessPromotionProgram.query(trx).insertGraph(
            mappedPromotion,
        );

        await trx.commit();

        res.status(200).json({
            promotionProgram,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

/**
 * Get the insights for a specific promotionId.
 *
 * Insights include:
 *
 * 1) Get the total amount saved using a particular promotion;
 * 2) Retrieve the count of orders an individual promotion has been used
 * 3) Retrieve the count of distinct customers who have used the promotion
 *
 * @param {Number} promotionId
 */
async function getPromotionInsights(promotionId) {
    const insights = await StoreCustomer.query()
        .select(
            raw(`
    count(si."promotionId") as "totalTimesUsed",
    count(distinct("centsCustomerId")) as "distinctCustomerCount",
    SUM(COALESCE(si."promotionAmount",0)) as "totalSaved"
    `),
        )
        .join(
            raw(`(select id,"promotionAmount","promotionId","storeCustomerId" from "serviceOrders" where "promotionId" =${promotionId}
        UNION
        select id,"promotionAmount","promotionId","storeCustomerId" from "inventoryOrders" where "promotionId" =${promotionId})`).as(
                'si',
            ),
            'si.storeCustomerId',
            'storeCustomers.id',
        )
        .first();
    return insights;
}

/**
 * Retrieve a list of all promotion programs for a given business
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function getIndividualPromotionProgram(req, res, next) {
    try {
        const { id } = req.params;
        const business = await getBusiness(req);
        const promotionProgram = await BusinessPromotionProgram.query()
            .withGraphJoined('[storePromotions, promotionItems(promotionItemsFilter)]')
            .where({
                'businessPromotionPrograms.businessId': business.id,
            })
            .modifiers({
                promotionItemsFilter: (query) => {
                    query.where('isDeleted', false);
                },
            })
            .findById(id);

        const insights = await getPromotionInsights(promotionProgram.id, business.id);

        res.status(200).json({
            success: true,
            promotionProgram,
            totalTimesInOrder: Number(insights.totalTimesUsed),
            totalSaved: Number(insights.totalSaved),
            distinctCustomers: Number(insights.distinctCustomerCount),
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Map the update-promotions payload to proper attributes for database
 *
 * @param {*} id
 * @param {*} request
 * @param {*} business
 */
async function mapUpdatedPromotionRequest(id, request, business) {
    const mappedResponse = {};

    const promotion = await BusinessPromotionProgram.query()
        .withGraphJoined('[promotionItems]')
        .findById(id);

    if (request.locationEligibilityType || request.storePromotions) {
        const storeData = await mapStoreData(
            request.storePromotions,
            business.id,
            request.locationEligibilityType,
        );

        mappedResponse.storePromotions = storeData;
        mappedResponse.locationEligibilityType = request.locationEligibilityType;
    }

    const requirementType = request.requirementType
        ? request.requirementType
        : promotion.requirementType;
    const requirementValue =
        request.requirementValue >= 0 ? request.requirementValue : promotion.requirementValue;

    mappedResponse.id = id;
    mappedResponse.active = request.active !== null ? request.active : promotion.active;
    mappedResponse.promotionItems = request.promotionItems
        ? await addBusinessIdToProgramItems(request.promotionItems, business.id)
        : promotion.promotionItems;

    mappedResponse.name = request.name ? request.name : promotion.name;
    mappedResponse.promotionType = request.promotionType
        ? request.promotionType
        : promotion.promotionType;
    mappedResponse.appliesToType = request.appliesToType
        ? request.appliesToType
        : promotion.appliesToType;
    mappedResponse.discountValue = request.discountValue
        ? getDiscountValue(request.discountValue)
        : promotion.discountValue;
    mappedResponse.customerRedemptionLimit =
        request.customerRedemptionLimit >= 0
            ? request.customerRedemptionLimit
            : promotion.customerRedemptionLimit;
    mappedResponse.startDate = request.startDate ? request.startDate : promotion.startDate;
    mappedResponse.endDate = request.endDate !== undefined ? request.endDate : promotion.endDate;
    mappedResponse.activeDays = request.activeDays
        ? JSON.stringify(request.activeDays)
        : promotion.activeDays;
    mappedResponse.requirementType = requirementType;
    mappedResponse.requirementValue = requirementValue;

    const minRequirements = {
        requirementType,
        requirementValue,
    };

    [mappedResponse.balanceRule, mappedResponse.redemptionRule] = await mapLightrailRules(
        mappedResponse.discountValue,
        mappedResponse.promotionType,
        minRequirements,
    );

    return mappedResponse;
}

/**
 * Update a promotion for a given business
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function updatePromotion(req, res, next) {
    let trx = null;
    try {
        const { id } = req.params;
        const business = await getBusiness(req);
        const mappedRequest = await mapUpdatedPromotionRequest(id, req.body, business);

        trx = await transaction.start(BusinessPromotionProgram.knex());

        const promotionProgram = await BusinessPromotionProgram.query(trx)
            .withGraphJoined('[storePromotions, promotionItems]')
            .upsertGraph(mappedRequest)
            .returning('*');

        await trx.commit();

        res.status(200).json({
            promotionProgram,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = {
    getAllPromotionsForBusiness,
    createPromotion,
    getIndividualPromotionProgram,
    updatePromotion,
};
