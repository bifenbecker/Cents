const { transaction } = require('objection');
const ServiceReferenceItemDetailModifier = require('../models/serviceReferenceItemDetailModifier');
const Model = require('../models/index');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

/**
 * Fetch a list of all ServiceReferenceItemDetail entries where soldItemType is Modifier
 * and insert those records into ServiceReferenceItemDetailModifier
 */
async function migrateExistingModifierLineItems() {
    let trx = null;
    try {
        trx = await transaction.start(ServiceReferenceItemDetailModifier.knex());

        const query = `
            INSERT INTO "serviceReferenceItemDetailModifiers"
            (
                "serviceReferenceItemDetailId",
                "modifierId",
                "modifierName",
                "unitCost",
                "quantity",
                "totalCost",
                "modifierPricingType",
                "createdAt",
                "updatedAt",
                "deletedAt"
            )
            SELECT
                "serviceReferenceItemDetails"."id",
                "modifiers"."id",
                "serviceReferenceItemDetails"."lineItemName",
                "serviceReferenceItemDetails"."lineItemUnitCost",
                "serviceReferenceItemDetails"."lineItemQuantity",
                "serviceReferenceItemDetails"."lineItemTotalCost",
                "serviceReferenceItemDetails"."pricingType",
                "serviceReferenceItemDetails"."createdAt",
                "serviceReferenceItemDetails"."updatedAt",
                "serviceReferenceItemDetails"."deletedAt"
            FROM "serviceReferenceItemDetails"
            JOIN "serviceModifiers" ON "serviceModifiers"."id" = "serviceReferenceItemDetails"."soldItemId" AND "serviceReferenceItemDetails"."soldItemType" = 'Modifier'
            JOIN "modifiers" ON "modifiers"."id" = "serviceModifiers"."modifierId"
            WHERE "serviceReferenceItemDetails"."soldItemType" = 'Modifier'
        `;

        await Model.query(trx).knex().raw(query);

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', `Error migrating modifier line items: ' + ${JSON.stringify(error)}`);
        throw Error(error);
    }
}

module.exports = exports = { migrateExistingModifierLineItems };
