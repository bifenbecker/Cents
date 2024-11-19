import React, {useCallback, useMemo} from "react";
import {Flex, Text} from "rebass/styled-components";
import {DateTime} from "luxon";

import {deliveryProviders} from "../../constants";
import {getDeliveryEstimate} from "../../../../api/uber";
import {toDollars, getTimeFromMilliSeconds} from "../../utils";
import {
  buildWindowOption,
  generateOnDemandWindowOptions,
  generateOwnDriverWindowOptions,
  isSameDay,
} from "./utils";
import windowSelectionActions from "./actions";

import {ToggleButton} from "../../../common";

const TimeSelection = props => {
  const {
    uberAuthToken,
    currentTabId,
    storeSettings,
    selectedDate,
    customerAddress,
    timeZone,
    selectedTimeWindow,
    uberEstimate,
    dispatch,
    isPickup,
    setLoading,
    timingsId,
    latestDeliveryStartTime,
    currentOrderDelivery,
    orderType,
    isProcessingCompleted,
    canUpdatePickup,
  } = props;
  const oldWindow = useMemo(() => {
    return isPickup
      ? {
          deliveryWindow: currentOrderDelivery?.pickup?.deliveryWindow,
          timingsId: currentOrderDelivery?.pickup?.timingsId,
          deliveryProvider: currentOrderDelivery?.pickup?.deliveryProvider,
        }
      : {
          deliveryWindow: currentOrderDelivery?.delivery?.deliveryWindow,
          timingsId: currentOrderDelivery?.delivery?.timingsId,
          deliveryProvider: currentOrderDelivery?.delivery?.deliveryProvider,
        };
  }, [isPickup, currentOrderDelivery]);

  const oldPickupOrDeliveryDate = useMemo(() => {
    return oldWindow?.deliveryWindow?.length
      ? DateTime.fromMillis(Number(oldWindow?.deliveryWindow?.[0])).setZone(timeZone)
      : null;
  }, [oldWindow, timeZone]);

  const getWindows = useCallback(() => {
    const params = {
      storeSettings,
      selectedDate,
      timeZone,
      minTimeInMillis:
        isPickup || isProcessingCompleted ? null : latestDeliveryStartTime?.ts,
    };
    const {deliveryWindow, timingsId, deliveryProvider} = oldWindow;
    const isSameDeliveryProvider = deliveryProvider === currentTabId;
    let windows =
      !isPickup && !latestDeliveryStartTime
        ? []
        : currentTabId === deliveryProviders.ownDriver
        ? generateOwnDriverWindowOptions(params)
        : generateOnDemandWindowOptions(params);

    if (
      deliveryWindow?.length &&
      isSameDeliveryProvider &&
      oldPickupOrDeliveryDate?.day === selectedDate?.day
    ) {
      const selectedWindowIdx = windows?.findIndex(
        ({value, ...window}) =>
          timingsId === window.timingsId &&
          Number(value?.[0]) === Number(deliveryWindow?.[0]) &&
          Number(value?.[1]) === Number(deliveryWindow?.[1])
      );
      const currentStartTime = deliveryWindow?.[0]
        ? DateTime.fromMillis(Number(deliveryWindow[0]))?.setZone(timeZone)
        : null;
      if (selectedWindowIdx > -1) {
        windows.splice(selectedWindowIdx, 1, {
          ...windows[selectedWindowIdx],
          isPastWindow: true,
        });
      } else if (
        isPickup ||
        orderType === "SERVICE" ||
        (latestDeliveryStartTime &&
          (latestDeliveryStartTime < currentStartTime ||
            (isSameDay(latestDeliveryStartTime, currentStartTime, timeZone) &&
              !canUpdatePickup)))
      ) {
        windows.unshift({
          ...buildWindowOption(
            getTimeFromMilliSeconds(deliveryWindow?.[0], timeZone),
            getTimeFromMilliSeconds(deliveryWindow?.[1], timeZone),
            timingsId
          ),
          isPastWindow: true,
        });
      }
    }
    return windows;
  }, [
    timeZone,
    isPickup,
    oldWindow,
    orderType,
    currentTabId,
    selectedDate,
    storeSettings,
    isProcessingCompleted,
    latestDeliveryStartTime,
    oldPickupOrDeliveryDate,
    canUpdatePickup,
  ]);

  const windowsTimings = useMemo(() => {
    if (currentTabId && storeSettings?.dayWiseWindows?.length && selectedDate) {
      return getWindows() || [];
    }
  }, [getWindows, selectedDate, currentTabId, storeSettings]);

  const getUberDeliveryEstimate = async (timingsId, deliveryTimeArray) => {
    try {
      setLoading(true);

      if (!uberAuthToken) {
        dispatch({
          type: windowSelectionActions.API_FAILED,
          payload: "Could not get uber estimate",
        });
        setLoading(false);
        return;
      }

      dispatch({type: windowSelectionActions.API_STARTED});
      const data = isPickup
        ? {}
        : {
            storeId: storeSettings?.storeId,
            uberToken: uberAuthToken,
            dropoffId: customerAddress.googlePlacesId,
            deliveryTimes: deliveryTimeArray,
          };
      const estimateResponse = await getDeliveryEstimate(data);

      dispatch({
        type: windowSelectionActions.SET_UBER_ESTIMATE_AND_TIME_WINDOW,
        payload: {
          uberEstimate: {
            estimateId: estimateResponse.data.estimateId,
            totalDeliveryCost: Number(
              estimateResponse.data.estimates[0].delivery_fee.total
            ),
            pickupAt: estimateResponse.data.estimates[0].pickup_at,
          },
          deliveryWindow: deliveryTimeArray,
          timingsId,
        },
      });

      setLoading(false);
    } catch (error) {
      dispatch({
        type: windowSelectionActions.API_FAILED,
        payload:
          error?.response?.data?.error || "Something went wrong while fetching estimates",
      });
      setLoading(false);
    }
  };

  const selectTimeWindow = time => {
    if (currentTabId === deliveryProviders.uber) {
      getUberDeliveryEstimate(time.timingsId, time.value);
    } else {
      let payload = {
        windowTimings: {
          timingsId: time.timingsId,
          deliveryWindow: time.value,
        },
      };
      dispatch({
        type: windowSelectionActions.SET_SELECTED_TIME_WINDOWS,
        payload,
      });
    }
  };

  return (
    <Flex {...styles.timeContainer}>
      {windowsTimings?.length ? (
        windowsTimings.map(time => (
          <ToggleButton
            {...styles.individualDeliveryTime}
            key={["timingsId", time?.timingsId, ...time?.value].join("-")}
            checked={
              "" + selectedTimeWindow === "" + time.value && timingsId === time.timingsId
            }
            onChange={() => selectTimeWindow(time)}
          >
            <Flex {...styles.individualDeliveryTimeText}>
              {time.display}
              {time.isPastWindow ? <Text {...styles.current}>current</Text> : null}
              <Text {...styles.uberEstimateText}>
                {currentTabId === deliveryProviders.uber &&
                "" + selectedTimeWindow === "" + time.value &&
                uberEstimate.totalDeliveryCost
                  ? `~ ${toDollars(uberEstimate.totalDeliveryCost / 100)}`
                  : null}
              </Text>
            </Flex>
          </ToggleButton>
        ))
      ) : (
        <Text>
          {selectedDate
            ? `Please select a date to show ${isPickup ? "pickup" : "drop-off"} slots`
            : `No available ${isPickup ? "pickup" : "drop-off"} slots`}
        </Text>
      )}
    </Flex>
  );
};

const styles = {
  timeContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
      pb: "20px",
      overflow: "scroll",
    },
  },
  individualDeliveryTime: {
    width: "100%",
    height: "56px",
    mt: "10px",
    fontSize: ["14px", "16px"],
  },
  individualDeliveryTimeText: {
    alignItems: "center",
    justifyContent: "center",
    sx: {
      fontWeight: 600,
    },
  },
  uberEstimateText: {
    fontFamily: "secondary",
    fontStyle: "italic",
    color: "#7B7B7B",
    ml: "2px",
    sx: {
      fontWeight: "normal",
    },
  },
  current: {
    fontSize: "12px",
    color: "TEXT_GREY",
    fontFamily: "secondary",
    fontWeight: 500,
    pl: "12px",
    display: "inline",
    fontStyle: "italic",
  },
};

export default TimeSelection;
