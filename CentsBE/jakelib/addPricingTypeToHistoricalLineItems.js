const { transaction } = require('objection');
const ServiceReferenceItemDetail = require('../models/serviceReferenceItemDetail');
const Model = require('../models/index');
const { pricingStructureTypes } = require('../constants/constants');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

/**
 * Update the individual line item
 *
 * @param {Object} lineItem
 * @param {void} trx
 */
async function updatePricingTypeForIndividualLineItem(lineItem, trx) {
    let updatedLineItem = null;

    const { category, id, soldItemType } = lineItem;
    const shouldHavePerPound =
        category === pricingStructureTypes.PER_POUND || soldItemType === 'Modifier';

    if (shouldHavePerPound) {
        updatedLineItem = await ServiceReferenceItemDetail.query(trx)
            .patch({
                pricingType: pricingStructureTypes.PER_POUND,
            })
            .findById(id)
            .returning('*');
    } else {
        updatedLineItem = await ServiceReferenceItemDetail.query(trx)
            .patch({
                pricingType: pricingStructureTypes.FIXED_PRICE,
            })
            .findById(id)
            .returning('*');
    }

    return updatedLineItem;
}

/**
 * Fetch a list of all ServiceReferenceItemDetail entries where pricingType is null
 * and perform the following:
 *
 * 1) Determine proper pricingType based on historical data
 * 2) Apply new pricingType structure
 */
async function addPricingTypeToLineItems() {
    let trx = null;
    try {
        trx = await transaction.start(ServiceReferenceItemDetail.knex());

        const updateQuery = `
            UPDATE
                "serviceReferenceItemDetails"
            SET 
                "pricingType" = CASE WHEN "category" = 'PER_POUND' OR "soldItemType" = 'Modifier' THEN 'PER_POUND' ELSE 'FIXED_PRICE' END
            WHERE
                "pricingType" IS NULL
        `;
        await Model.query(trx).knex().raw(updateQuery);

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', `Error adding pricingType to line items: ' + ${error}`);
        throw Error(error);
    }
}

module.exports = exports = {
    addPricingTypeToLineItems,
    updatePricingTypeForIndividualLineItem,
};
