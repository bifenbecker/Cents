
exports.up = function(knex) {
    const query = `
        with "storeCustomersWithoutBusinessCustomerId" as (
            select "id" as "storeCustomerId", "centsCustomerId", "businessId" 
            from "storeCustomers" 
            where "businessCustomerId" is null
        ),
        "storeCustomersBusinessCustomerId" as (
            select "storeCustomersWithoutBusinessCustomerId"."centsCustomerId", "storeCustomersWithoutBusinessCustomerId"."businessId" ,
            (
                select sum(amount) as "creditAmount" from "creditHistory"
                where "storeCustomersWithoutBusinessCustomerId"."centsCustomerId" = "creditHistory"."customerId" 
                and  "storeCustomersWithoutBusinessCustomerId"."businessId" = "creditHistory"."businessId"
        
                    group by "customerId", "businessId"
            ) as "creditAmount"
            from "storeCustomersWithoutBusinessCustomerId"
            left outer join "businessCustomers" bc on "storeCustomersWithoutBusinessCustomerId"."centsCustomerId"=bc."centsCustomerId"
                and "storeCustomersWithoutBusinessCustomerId"."businessId"=bc."businessId"
            where bc.id is null
            group by "storeCustomersWithoutBusinessCustomerId"."centsCustomerId", "storeCustomersWithoutBusinessCustomerId"."businessId"
            
        )
        insert into "businessCustomers" ("centsCustomerId", "businessId", "creditAmount") 
        select "centsCustomerId", "businessId", "creditAmount" from "storeCustomersBusinessCustomerId"
    `
    return knex.raw(query);
};

exports.down = function(knex) {
  return
};
