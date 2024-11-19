
exports.up = function(knex) {
  const query = `
    with "storeCustomersWithoutBusinessCustomerId" as (
        select "id" as "storeCustomerId", "centsCustomerId", "businessId" 
        from "storeCustomers" 
        where "businessCustomerId" is null
    ),
    "storeCustomersBusinessCustomerId" as (
        select bc.id as "businessCustomerId", "storeCustomersWithoutBusinessCustomerId"."storeCustomerId" from "businessCustomers" bc
        inner join "storeCustomersWithoutBusinessCustomerId" on "storeCustomersWithoutBusinessCustomerId"."centsCustomerId"=bc."centsCustomerId"
            and "storeCustomersWithoutBusinessCustomerId"."businessId"=bc."businessId"
        
    )
    update "storeCustomers" set "businessCustomerId"="storeCustomersBusinessCustomerId"."businessCustomerId"
    from "storeCustomersBusinessCustomerId" where "storeCustomers"."id"="storeCustomersBusinessCustomerId"."storeCustomerId"
  `
  return knex.raw(query);
};

exports.down = function(knex) {
  return;
};
