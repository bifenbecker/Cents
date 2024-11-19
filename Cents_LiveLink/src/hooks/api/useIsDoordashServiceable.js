import {DateTime} from "luxon";
import {useCallback, useState} from "react";

import {getDoorDashDeliveryEstimate} from "../../api/doordash";

import {getStartAndEndTimes} from "../../utils/date";

const useIsDoorDashServiceable = () => {
  const [loading, setLoading] = useState(false);

  const isDoorDashServiceable = useCallback(
    async ({address, timeZone, onDemandDeliverySettings}) => {
      try {
        setLoading(true);
        const firstTiming = onDemandDeliverySettings?.dayWiseWindows?.find(
          daywiseWindow => daywiseWindow.timings.length
        )?.timings?.[0];
        if (!firstTiming) {
          return false;
        }
        // Check if doordash can serve the changed address.
        const {startTime, endTime} = getStartAndEndTimes(
          DateTime.local()
            .setZone(timeZone)
            .startOf("day"),
          firstTiming,
          timeZone
        );
        const doordashEstimate = await getDoorDashDeliveryEstimate({
          type: "PICKUP",
          customerAddress: address,
          netOrderTotal: 1,
          deliveryTime: [startTime?.ts, endTime?.ts],
          storeId: onDemandDeliverySettings.storeId,
        });
        return doordashEstimate?.data?.success;
      } catch (err) {
        return;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {loading, isDoorDashServiceable};
};

export default useIsDoorDashServiceable;
