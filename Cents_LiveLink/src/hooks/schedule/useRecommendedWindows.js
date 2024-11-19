import {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {isEmpty} from "lodash";
import {DateTime} from "luxon";
import {
  getNearStoresData,
  getCurrentView,
  getReturnWindowsState,
} from "components/online-order/redux/selectors";
import {FETCHING_STATUS} from "constants/api";
import {DELIVERY_TYPE_KEYS, VIEWS} from "constants/order";

const getPriorWindow = (deliveryDays) => {
  const firstPriorOwnWindowsIndex = deliveryDays.findIndex(
    (day) => day[DELIVERY_TYPE_KEYS.OWN].length
  );
  if (-1 < firstPriorOwnWindowsIndex) {
    return deliveryDays[firstPriorOwnWindowsIndex][DELIVERY_TYPE_KEYS.OWN].shift();
  }

  const firstPriorOnDemandWindowsIndex = deliveryDays.findIndex(
    (day) => day[DELIVERY_TYPE_KEYS.ON_DEMAND].length
  );
  if (-1 < firstPriorOnDemandWindowsIndex) {
    return deliveryDays[firstPriorOnDemandWindowsIndex][
      DELIVERY_TYPE_KEYS.ON_DEMAND
    ].shift();
  }
  return null;
};

const getNextWindow = (deliveryDays) => {
  const nextOwnDayIndex = deliveryDays.findIndex(
    (day) => day[DELIVERY_TYPE_KEYS.OWN].length
  );
  const nextOnDemandDayIndex = deliveryDays.findIndex(
    (day) => day[DELIVERY_TYPE_KEYS.ON_DEMAND].length
  );

  if (nextOwnDayIndex < 0 && nextOnDemandDayIndex > -1) {
    return deliveryDays[nextOnDemandDayIndex][DELIVERY_TYPE_KEYS.ON_DEMAND].shift();
  } else if (nextOwnDayIndex > -1 && nextOnDemandDayIndex < 0) {
    return deliveryDays[nextOwnDayIndex][DELIVERY_TYPE_KEYS.OWN].shift();
  } else if (nextOwnDayIndex < 0 && nextOnDemandDayIndex < 0) {
    return null;
  }

  const nextOwnWindow = deliveryDays[nextOwnDayIndex][DELIVERY_TYPE_KEYS.OWN][0];
  const nextOnDemandWindow =
    deliveryDays[nextOnDemandDayIndex][DELIVERY_TYPE_KEYS.ON_DEMAND][0];

  const ownIsEarlier =
    DateTime.fromISO(nextOwnWindow.startTime).valueOf() <
    DateTime.fromISO(nextOnDemandWindow.startTime).valueOf();
  return ownIsEarlier
    ? deliveryDays[nextOwnDayIndex][DELIVERY_TYPE_KEYS.OWN].shift()
    : deliveryDays[nextOnDemandDayIndex][DELIVERY_TYPE_KEYS.ON_DEMAND].shift();
};

export const useRecommendedWindows = () => {
  const currentView = useSelector(getCurrentView);
  const isPickup = [VIEWS.ALL_WINDOWS_PICKUP, VIEWS.RECOMMENDED_PICKUP].includes(
    currentView
  );
  const {
    data: {deliveryDays},
    fetchingStatus,
  } = useSelector(isPickup ? getNearStoresData : getReturnWindowsState);
  const [recommendedWindows, setRecommendedWindows] = useState({});

  useEffect(() => {
    if (isEmpty(recommendedWindows) && fetchingStatus === FETCHING_STATUS.FULFILLED) {
      const deliveryDaysClone = JSON.parse(JSON.stringify(deliveryDays));
      const recommendedWindows = {
        recommended: getPriorWindow(deliveryDaysClone),
        other: [
          getPriorWindow(deliveryDaysClone),
          getNextWindow(deliveryDaysClone),
          getNextWindow(deliveryDaysClone),
        ],
      };
      setRecommendedWindows(recommendedWindows);
    }
  }, [deliveryDays, fetchingStatus, recommendedWindows]);
  return recommendedWindows;
};
