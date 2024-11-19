WITH "newCustomers" AS 
(
	SELECT *, ROW_NUMBER() OVER(PARTITION BY "centsCustomerId" ORDER BY "createdAt" ASC) rn FROM
	(
		SELECT * FROM 
		(
			(
				SELECT "serviceOrders"."netOrderTotal" AS "firstVisitAmount", 
				"serviceOrders"."createdAt", 
				 trim(concat("storeCustomers"."firstName", ' ', "storeCustomers"."lastName")) AS "fullName", 
				"storeCustomers"."centsCustomerId", 
				"stores"."name" AS "registerLocation",
				TO_CHAR("storeCustomers"."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'MM/DD/YYYY') AS "registerDate"
				FROM "storeCustomers"
				LEFT JOIN "serviceOrders" on "storeCustomers".id="serviceOrders"."storeCustomerId" 
				JOIN "stores" ON "stores".id="storeCustomers"."storeId"
				JOIN "storeSettings" ON "storeSettings"."storeId"="stores".id
				WHERE "storeCustomers"."storeId" IN ({{storesFilter}})
				AND "storeCustomers"."createdAt" BETWEEN '{{finalStartDate}}' AND '{{finalEndDate}}'
				ORDER BY "serviceOrders"."createdAt" ASC
			)
			 union 
			(
				SELECT "inventoryOrders"."netOrderTotal" AS "firstVisitAmount", 
				"inventoryOrders"."createdAt", 
				trim(concat("storeCustomers"."firstName", ' ', "storeCustomers"."lastName")) AS "fullName", 
				"storeCustomers"."centsCustomerId", 
				"stores"."name" AS "registerLocation",
				TO_CHAR("storeCustomers"."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'MM/DD/YYYY') AS "registerDate"
        		FROM "storeCustomers"
				LEFT JOIN "inventoryOrders" on "storeCustomers".id="inventoryOrders"."storeCustomerId" 
				JOIN "stores" ON "stores".id="storeCustomers"."storeId"
				JOIN "storeSettings" ON "storeSettings"."storeId"="stores".id
				WHERE "storeCustomers"."storeId" IN ({{storesFilter}})
				AND "storeCustomers"."createdAt" BETWEEN '{{finalStartDate}}' AND '{{finalEndDate}}'
				ORDER BY "inventoryOrders"."createdAt" ASC
			)
		) AS "customers" ORDER BY "createdAt" ASC
	) AS "orderedCustomers"
)
SELECT "fullName", 
COALESCE("firstVisitAmount", 0) AS "firstVisitAmount", 
"registerDate", 
"registerLocation" FROM "newCustomers" WHERE rn=1