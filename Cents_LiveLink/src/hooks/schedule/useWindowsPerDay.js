import {useSelector} from "react-redux";
import {
  getNearStoresData,
  getCurrentView,
  getReturnWindowsState,
} from "components/online-order/redux/selectors";
import {DELIVERY_TYPE_KEYS, VIEWS} from "constants/order";

export const useWindowsPerDay = () => {
  const currentView = useSelector(getCurrentView);
  const isPickup = [
    VIEWS.ALL_WINDOWS_PICKUP,
    VIEWS.RECOMMENDED_PICKUP,
    VIEWS.RETURN_QUESTION,
    VIEWS.AVAILABLE_PICKUP_DATES,
  ].includes(currentView);

  const isReturn = [
    VIEWS.ALL_WINDOWS_RETURN,
    VIEWS.RECOMMENDED_RETURN,
    VIEWS.SUBSCRIPTION_OFFER,
    VIEWS.AVAILABLE_RETURN_DATES,
  ].includes(currentView);

  const {
    data: {deliveryDays},
  } = useSelector(isPickup ? getNearStoresData : getReturnWindowsState);
  let haveOwn = false;
  let haveOnDemand = false;
  let formattedDays = [];

  if (isPickup || isReturn) {
    haveOwn = deliveryDays.reduce(
      (isHave, day) => isHave || day[DELIVERY_TYPE_KEYS.OWN].length,
      false
    );
    haveOnDemand = deliveryDays.reduce(
      (isHave, day) => isHave || day[DELIVERY_TYPE_KEYS.ON_DEMAND].length,
      false
    );

    formattedDays = deliveryDays.filter(
      (day) =>
        day[DELIVERY_TYPE_KEYS.OWN].length || day[DELIVERY_TYPE_KEYS.ON_DEMAND].length
    );
  }

  return {deliveryDays: formattedDays, haveOwn, haveOnDemand, isPickup, isReturn};
};
