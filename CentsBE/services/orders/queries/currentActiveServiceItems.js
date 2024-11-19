const { raw } = require('objection');
const ServiceOrderItem = require('../../../models/serviceOrderItem');

async function currentActiveServiceOrderItems(serviceOrderId, isPromo, transaction) {
    let items = ServiceOrderItem.query(transaction)
        .select(
            'serviceOrderItems.id as orderItemId',
            'serviceOrderItems.price as price',
            'serviceReferenceItems.id as referenceItemId',
            'serviceReferenceItemDetails.id as serviceReferenceItemDetailsId',
            'serviceReferenceItems.servicePriceId',
            'serviceReferenceItems.serviceModifierId as modifierId',
            'serviceReferenceItems.inventoryItemId as inventoryId',
            'serviceReferenceItemDetails.category as category',
            'serviceReferenceItemDetails.pricingType as pricingType',
            'serviceReferenceItemDetails.lineItemQuantity as quantity',
            'serviceReferenceItemDetails.lineItemQuantity as count',
            'serviceReferenceItemDetails.customerName as customerName',
            'serviceReferenceItemDetails.customerPhoneNumber as customerPhoneNumber',
            'serviceReferenceItemDetails.lineItemTotalCost as totalCost',
            'serviceReferenceItemDetails.lineItemTotalCost as totalPrice',
            'serviceReferenceItemDetails.lineItemUnitCost as unitCost',
            'serviceOrderItems.status as status',
            raw(`
                json_agg(
                    json_build_object(
                        'id', "serviceReferenceItemDetailModifiers".id,
                        'serviceReferenceItemDetailId', "serviceReferenceItemDetailModifiers"."serviceReferenceItemDetailId",
                        'modifierId', "serviceReferenceItemDetailModifiers"."modifierId",
                        'modifierName', "serviceReferenceItemDetailModifiers"."modifierName",
                        'unitCost', "serviceReferenceItemDetailModifiers"."unitCost",
                        'quantity', "serviceReferenceItemDetailModifiers"."quantity",
                        'totalCost', "serviceReferenceItemDetailModifiers"."totalCost",
                        'modifierPricingType', "serviceReferenceItemDetailModifiers"."modifierPricingType"
                    )
                ) AS "modifierLineItems"
            `),
            raw(`
            case 
                when "serviceReferenceItemDetails"."soldItemType" = 'InventoryItem' then 'INVENTORY'
                when "serviceReferenceItemDetails"."soldItemType" = 'Modifier' then 'MODIFIER'
                else 'SERVICE' end as "lineItemType"
            `),
            'serviceReferenceItemDetails.soldItemId as priceId',
            raw('sum("serviceReferenceItemDetails"."lineItemTotalCost") over() as "orderTotal"'),
        )
        .join('serviceReferenceItems', (builder) => {
            builder
                .on('serviceReferenceItems.orderItemId', '=', 'serviceOrderItems.id')
                .andOn('serviceOrderItems.orderId', '=', Number(serviceOrderId))
                .onNull('serviceOrderItems.deletedAt');
        })
        .join(
            'serviceReferenceItemDetails',
            'serviceReferenceItemDetails.serviceReferenceItemId',
            'serviceReferenceItems.id',
        )
        .leftJoin(
            'serviceReferenceItemDetailModifiers',
            'serviceReferenceItemDetailModifiers.serviceReferenceItemDetailId',
            'serviceReferenceItemDetails.id',
        )
        .groupBy(
            'serviceOrderItems.id',
            'serviceReferenceItems.id',
            'serviceReferenceItemDetails.id',
            'serviceReferenceItemDetailModifiers.id',
        )
        .orderBy('orderItemId');
    items = isPromo
        ? items
              .select(
                  'servicePrices.serviceId as serviceMasterId',
                  'inventoryItems.inventoryId as inventoryMasterId',
              )
              .leftJoin('servicePrices', 'servicePrices.id', 'serviceReferenceItems.servicePriceId')
              .leftJoin(
                  'inventoryItems',
                  'inventoryItems.id',
                  'serviceReferenceItems.inventoryItemId',
              )
              .groupBy('servicePrices.serviceId', 'inventoryItems.inventoryId')
        : items;
    items = await items;
    return items;
}

module.exports = exports = currentActiveServiceOrderItems;
