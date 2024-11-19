exports.up = function (knex) {
    return knex.raw(`-- FUNCTION: public.getordercode(integer)

    -- DROP FUNCTION public.getordercode(integer);
    
    CREATE OR REPLACE FUNCTION public.getordercode(
        businessownerid integer)
        RETURNS text
        LANGUAGE 'plpgsql'
    
        COST 100
        VOLATILE 
        
    AS $BODY$
    DECLARE totalOrders integer;
    BEGIN
     SELECT "totalOrders" INTO totalOrders FROM "businessOrdersCount" WHERE "businessId"=businessOwnerId;
     UPDATE "businessOrdersCount" SET "totalOrders"=totalOrders+1 WHERE "businessId"=businessOwnerId;
     return  1000+totalOrders+1;
    END
    $BODY$;
    `);
};

exports.down = function (knex) {
    return knex.raw(`
    drop function getordercode(integer)
  `);
};
