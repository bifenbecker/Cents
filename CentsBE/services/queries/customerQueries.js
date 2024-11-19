const { raw } = require('objection');
const CentsCustomer = require('../../models/centsCustomer');

function getCustomers(storeId, businessId, centsCustomerId, page, count = false) {
    let customers = CentsCustomer.query();

    customers = centsCustomerId ? customers.withGraphFetched('addresses') : customers;

    customers = count
        ? customers.select(raw('count("centsCustomers".id) over () as "totalCount"'))
        : customers;

    customers.select(
        'centsCustomers.id as centsCustomerId',
        'centsCustomers.email as email',
        'centsCustomers.phoneNumber as phoneNumber',
        'centsCustomers.firstName as firstName',
        'centsCustomers.lastName as lastName',
        'centsCustomers.stripeCustomerId as stripeCustomerId',
        'pricingTiers.id as pricingTierId',
        'pricingTiers.name as pricingTierName',
        'storeCustomers.id as storeCustomerId',
        'storeCustomers.notes as storeCustomerNotes',
        'storeCustomers.storeId as storeId',
        'storeCustomers.isHangDrySelected as boIsHangDrySelected',
        'storeCustomers.hangDryInstructions as boHangDryInstructions',
        raw(`trim(concat("centsCustomers"."firstName", ' ', "centsCustomers"."lastName")) as "fullName",
                     coalesce("centsCustomers"."languageId", 1) as "languageId",
                     coalesce(("creditHistory"."amount"), 0) as "creditAmount",
                     coalesce(("businessCustomers"."isCommercial"), false) as "isCommercial",
                     coalesce(("businessCustomers"."isInvoicingEnabled"), false) as "isInvoicingEnabled"`),
    );

    customers = centsCustomerId
        ? customers
        : customers.select(
              raw(`(select jsonb_build_object( 'orderCode', o."orderCode",
                        'orderId', o."id",
                        'orderableType', o."orderableType",
                        'status', o."status"
                    )
                    from (select "serviceOrders"."orderCode" as "orderCode", "serviceOrders"."status",
                    "serviceOrders"."id", 'ServiceOrder' as "orderableType"
                    from "serviceOrders" where "serviceOrders"."storeCustomerId" = "storeCustomers"."id" 
                    UNION  
                    select "inventoryOrders"."orderCode" as "orderCode", "inventoryOrders"."status",
                    "inventoryOrders"."id", 'InventoryOrder' as "orderableType"
                    from "inventoryOrders" where 
                    "inventoryOrders"."storeCustomerId" = "storeCustomers"."id" order by "orderCode" desc limit 1) as o) as order`),
          );

    customers
        .join('storeCustomers', function storeCustomerJoin() {
            this.on('storeCustomers.centsCustomerId', '=', 'centsCustomers.id')
                .andOn('storeCustomers.businessId', '=', businessId)
                .andOn('storeCustomers.storeId', '=', storeId);
        })
        .leftJoin('businessCustomers', function businessCustomerJoin() {
            this.on('businessCustomers.centsCustomerId', 'centsCustomers.id')
                .andOn('businessCustomers.businessId', '=', businessId)
                .onNull('businessCustomers.deletedAt');
        })
        .leftJoin('pricingTiers', 'pricingTiers.id', 'businessCustomers.commercialTierId')
        .leftJoin(
            raw(`(select round(sum(amount)::numeric, 2) as amount, "customerId" from "creditHistory"
                        where "businessId" = ${businessId} group by "customerId") as "creditHistory"`),
            'creditHistory.customerId',
            'centsCustomers.id',
        )
        .whereRaw(
            'concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName") <> \'Guest Account\'',
        )
        .orderBy('fullName');

    customers = centsCustomerId
        ? customers.where('centsCustomers.id', centsCustomerId).first()
        : customers.offset((Number(page) - 1) * 10).limit(10);

    return customers;
}

module.exports = exports = {
    getCustomers,
};
