
exports.up = function(knex) {
    const query = `
        delete from "businessCustomers" where id in (
            select "businessCustomers".id
            from "businessCustomers"
            left join "storeCustomers" on "storeCustomers"."businessCustomerId"="businessCustomers".id
            where  "businessCustomers"."centsCustomerId" in (
                select "centsCustomerId" from "businessCustomers"  group by "centsCustomerId", "businessId" having count(*) > 1
            ) and "storeCustomers".id is null 
        )
    `
    return knex.raw(query);
};
  
exports.down = function(knex) {
return;
};