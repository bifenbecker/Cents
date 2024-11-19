with "serviceIntakeWeights" as (
	select "serviceOrderWeights"."serviceOrderId", sum("serviceOrderWeights"."totalWeight") as "inTakePounds"
	from "serviceOrderWeights"
	inner join "serviceOrders" on "serviceOrderWeights"."serviceOrderId" = "serviceOrders"."id" 
	where "serviceOrderWeights"."step" = 1
	group by "serviceOrderWeights"."serviceOrderId"
),
"serviceBeforeProcessingWeights" as (
	select "serviceOrderWeights"."serviceOrderId", sum("serviceOrderWeights"."totalWeight") as "beforeProcessingPounds"
	from "serviceOrderWeights"
	inner join "serviceOrders" on "serviceOrderWeights"."serviceOrderId" = "serviceOrders"."id" 
	where "serviceOrderWeights"."step" = 2
	group by "serviceOrderWeights"."serviceOrderId"
),
"serviceOrderLogs" as (
  select distinct on ("orderActivityLog"."orderId", "orderActivityLog"."status")
  "orderActivityLog"."orderId", "orderActivityLog"."status", "orderActivityLog"."employeeName", "orderActivityLog"."updatedAt" 
  from "orderActivityLog"
  inner join "serviceOrders" on "serviceOrders"."id" = "orderActivityLog"."orderId"
),
"serviceAfterProcessingWeights" as (
	select "serviceOrderWeights"."serviceOrderId", sum("serviceOrderWeights"."totalWeight") as "afterProcessingPounds"
	from "serviceOrderWeights"
	inner join "serviceOrders" on "serviceOrderWeights"."serviceOrderId" = "serviceOrders"."id" 
	where "serviceOrderWeights"."step" = 3
	group by "serviceOrderWeights"."serviceOrderId"
),
"serviceCompletionWeights" as (
	select "serviceOrderWeights"."serviceOrderId", sum("serviceOrderWeights"."totalWeight") as "completionPounds"
	from "serviceOrderWeights"
	inner join "serviceOrders" on "serviceOrderWeights"."serviceOrderId" = "serviceOrders"."id" 
	where "serviceOrderWeights"."step" = 4
	group by "serviceOrderWeights"."serviceOrderId"
),
"serviceWashingEmployees" as (
	select distinct on ("washingEmployees"."serviceOrderId") * from ( 
		select  * from (select distinct on ("serviceOrderTurns"."serviceOrderId") 
		"serviceOrderTurns"."serviceOrderId", (case
				when "users"."firstname" is not null
					then (concat("users"."firstname", ' ', "users"."lastname"))
				else null
			end) as "employeeName", "turns"."updatedAt", 'turns' as "source"
		from "serviceOrderTurns"
		left join "turns" on "turns"."id" = "serviceOrderTurns"."turnId"
		left join "machines" on "machines"."id" = "turns"."machineId"
		left join "machineModels" on "machineModels"."id" = "machines"."modelId"
		left join "machineTypes" on "machineTypes"."id" = "machineModels"."typeId"
		left join "users" on "users"."id" = "turns"."userId"
		where "machineTypes"."name" = 'WASHER' and "users"."firstname" is not null
	 	order by "serviceOrderTurns"."serviceOrderId" asc, "turns"."createdAt" asc) first 
	
	  union   
	
	  select distinct on ("orderActivityLog"."orderId", "orderActivityLog"."status")
	  "orderActivityLog"."orderId" as "serviceOrderId", "orderActivityLog"."employeeName", "orderActivityLog"."updatedAt", 'logs' as "source"
		from "orderActivityLog"
	  where "orderActivityLog"."status" in ('PROCESSING', 'HUB_PROCESSING_ORDER') and "orderActivityLog"."employeeName" is not null
	) as "washingEmployees" order by "washingEmployees"."serviceOrderId", "source" desc
),
"serviceDryingEmployees" as (
	select distinct on ("dryingEmployees"."serviceOrderId") * from ( 
		select  * from (select distinct on ("serviceOrderTurns"."serviceOrderId") 
		"serviceOrderTurns"."serviceOrderId", (case
				when "users"."firstname" is not null
					then (concat("users"."firstname", ' ', "users"."lastname"))
				else null
			end) as "employeeName", "turns"."updatedAt", 'turns' as "source"
		from "serviceOrderTurns"
		left join "turns" on "turns"."id" = "serviceOrderTurns"."turnId"
		left join "machines" on "machines"."id" = "turns"."machineId"
		left join "machineModels" on "machineModels"."id" = "machines"."modelId"
		left join "machineTypes" on "machineTypes"."id" = "machineModels"."typeId"
		left join "users" on "users"."id" = "turns"."userId"
		where "machineTypes"."name" = 'DRYER' and "users"."firstname" is not null
	 	order by "serviceOrderTurns"."serviceOrderId" asc, "turns"."createdAt" asc) first 
	
	  union   
	
	  select distinct on ("orderActivityLog"."orderId", "orderActivityLog"."status")
	  "orderActivityLog"."orderId" as "serviceOrderId", "orderActivityLog"."employeeName", "orderActivityLog"."updatedAt", 'logs' as "source"
		from "orderActivityLog"
	  where "orderActivityLog"."status" in ('PROCESSING', 'HUB_PROCESSING_ORDER') and "orderActivityLog"."employeeName" is not null
	) as "dryingEmployees" order by "dryingEmployees"."serviceOrderId", "source" desc
)

select
"serviceOrders"."orderType" as "orderType",
"serviceOrders"."orderCode" as "orderCode",
"serviceOrders"."completedAt" as "completedAt",
to_char("serviceOrders"."completedAt" at time zone "storeSettings"."timeZone", 'MM-DD-YYYY') as "completedAtDate",
to_char("serviceOrders"."completedAt" at time zone "storeSettings"."timeZone", 'HH12:MI AM') as "completedAtTime",
"serviceOrders"."netOrderTotal"::float8::numeric::money as "orderTotal",
coalesce("serviceOrders"."tipAmount", 0)::float8::numeric::money as "tipTotal",
"serviceIntakeWeights"."inTakePounds" as "inTakePounds",
"serviceBeforeProcessingWeights"."beforeProcessingPounds" as "beforeProcessingPounds",
"intakeLogs"."employeeName" as "intakeEmployee",
to_char("intakeLogs"."updatedAt" at time zone "storeSettings"."timeZone", 'HH12:MI AM') as "intakeTime",
to_char("washingLog"."updatedAt" at time zone "storeSettings"."timeZone", 'HH12:MI AM') as "washingTime",
to_char("dryingLog"."updatedAt" at time zone "storeSettings"."timeZone", 'HH12:MI AM') as "dryingTime",
"readyForPickupProcessingLogs"."updatedAt" as "totalProcessingTimeEnd",
"washingLog"."updatedAt" as "totalProcessingTimeStart", 
"intakeLogs"."updatedAt" as "totalTurnaroundTimeStart",
"completeProcessingLogs"."employeeName" as "completeProcessingEmployee",
"serviceAfterProcessingWeights"."afterProcessingPounds" as "afterProcessingPounds",
"serviceCompletionWeights"."completionPounds" as "completionPounds",
"completeLogs"."employeeName" as "completedEmployee",
"paymentLogs"."employeeName" as "paymentEmployee",
"washingLog"."employeeName" as "washingEmployee",
"dryingLog"."employeeName" as "dryingEmployee",
"payments"."paymentProcessor" as "paymentMethod"
from "serviceOrders"
	inner join "stores" on "serviceOrders"."storeId" = "stores"."id"
	inner join "storeSettings" on "storeSettings"."storeId" = "stores"."id"
    left join "serviceIntakeWeights" on "serviceIntakeWeights"."serviceOrderId" = "serviceOrders"."id"
    left join "serviceBeforeProcessingWeights" on "serviceBeforeProcessingWeights"."serviceOrderId" = "serviceOrders"."id"
    left join "serviceAfterProcessingWeights" on "serviceAfterProcessingWeights"."serviceOrderId" = "serviceOrders"."id"
    left join "serviceCompletionWeights" on "serviceCompletionWeights"."serviceOrderId" = "serviceOrders"."id"
    left join "serviceOrderLogs" "intakeLogs" on "intakeLogs"."orderId" = "serviceOrders"."id" and "intakeLogs"."status" = 'READY_FOR_PROCESSING'
    left join "serviceOrderLogs" "completeProcessingLogs" on "completeProcessingLogs"."orderId" = "serviceOrders"."id" and "completeProcessingLogs"."status" in ('READY_FOR_PICKUP', 'HUB_PROCESSING_COMPLETE')
    left join "serviceOrderLogs" "readyForPickupProcessingLogs" on "readyForPickupProcessingLogs"."orderId" = "serviceOrders"."id" and "readyForPickupProcessingLogs"."status" = 'READY_FOR_PICKUP'
    left join "serviceOrderLogs" "completeLogs" on "completeLogs"."orderId" = "serviceOrders"."id" and "completeLogs"."status" = 'COMPLETED'
    left join "serviceOrderLogs" "paymentLogs" on "paymentLogs"."orderId" = "serviceOrders"."id" and "paymentLogs"."status" = (
      case
        when "serviceOrders"."paymentTiming" = 'PRE-PAY'
          then 'READY_FOR_PROCESSING'
        else 'COMPLETED'
      end
    )
    left join "serviceWashingEmployees" "washingLog" on "washingLog"."serviceOrderId" = "serviceOrders"."id"
    left join "serviceDryingEmployees" "dryingLog" on "dryingLog"."serviceOrderId" = "serviceOrders"."id"
	left join "orders" on "orders"."orderableId" = "serviceOrders"."id" and "orders"."orderableType" = 'ServiceOrder'
	left join "payments" on "payments"."orderId" = "orders"."id"
    where "serviceOrders"."storeId" in ({{storesIds}})
        and
        "serviceOrders"."status" = 'COMPLETED'
        and
        cast("serviceOrders"."completedAt" at time zone "storeSettings"."timeZone" as date) between '{{startDate}}' and '{{endDate}}'

union

select
'INVENTORY' as "orderType",
"inventoryOrders"."orderCode" as "orderCode",
"inventoryOrders"."updatedAt" as "completedAt",
to_char("inventoryOrders"."updatedAt" at time zone "storeSettings"."timeZone", 'MM-DD-YYYY') as "completedAtDate",
to_char("inventoryOrders"."updatedAt" at time zone "storeSettings"."timeZone", 'HH12:MI AM') as "completedAtTime",
"inventoryOrders"."netOrderTotal"::float8::numeric::money as "orderTotal",
coalesce("inventoryOrders"."tipAmount", 0)::float8::numeric::money as "tipTotal",
null as "inTakePounds",
null as "beforeProcessingPounds",
(
	case
		when "users"."firstname" is not null
			then (concat("users"."firstname", ' ', "users"."lastname"))
		else null
	end
) as "intakeEmployee",
null as "intakeTime",
null as "washingTime",
null as "dryingTime",
null as "totalProcessingTimeEnd",
null as "totalProcessingTimeStart",
null as "totalTurnaroundTimeStart",
null as "completeProcessingEmployee",
null as "afterProcessingPounds",
null as "completionPounds",
null as "completedEmployee",
(
	case
		when "users"."firstname" is not null
			then (concat("users"."firstname", ' ', "users"."lastname"))
		else null
	end
) as "paymentEmployee",
null as "washingEmployee",
null as "dryingEmployee",
"payments"."paymentProcessor" as "paymentMethod"
from "inventoryOrders"
	inner join "stores" on "inventoryOrders"."storeId" = "stores"."id"
	inner join "storeSettings" on "storeSettings"."storeId" = "stores"."id"
    left join "teamMembers" on "teamMembers"."id" = "inventoryOrders"."employeeId"
    left join "users" on "users"."id" = "teamMembers"."userId"
	left join "orders" on "orders"."orderableId" = "inventoryOrders"."id" and "orders"."orderableType" = 'InventoryOrder'
	left join "payments" on "payments"."orderId" = "orders"."id"
    where "inventoryOrders"."storeId" in ({{storesIds}})
        and
        "inventoryOrders"."status" = 'COMPLETED'
        and
        cast("inventoryOrders"."updatedAt" at time zone "storeSettings"."timeZone" as date) between '{{startDate}}' and '{{endDate}}'

order by "completedAt" desc