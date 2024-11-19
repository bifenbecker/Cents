import React, {useCallback, useContext, useMemo} from "react";
import {Flex, Text} from "rebass/styled-components";
import {setSelectedTimeWindowAction} from "./actions";

import {ToggleButton} from "../../../";
import WindowsSelectionDispatch from "./context";
import {getWindows} from "utils/schedule/getWindows";

const TimeSelection = (props) => {
  const {
    state,
    currentTabId,
    storeSettings,
    selectedDate,
    selectedTimeWindow,
    timingsId,
    earliestDeliveryStartTime,
  } = props;

  const {dispatch} = useContext(WindowsSelectionDispatch);

  const {
    isPickup,
    timeZone,
    loading,
    isProcessingCompleted,
    pickupDayWiseWindows,
    returnDayWiseWindows,
  } = state;

  const windowsTimings = useMemo(() => {
    if (
      currentTabId &&
      (isPickup ? pickupDayWiseWindows : returnDayWiseWindows)?.length &&
      selectedDate
    ) {
      return (
        getWindows({
          isPickup,
          pickupDayWiseWindows,
          returnDayWiseWindows,
          selectedDate,
          timeZone,
          isProcessingCompleted,
          earliestDeliveryStartTime,
          storeSettings,
          currentTabId,
        }) || []
      );
    }
  }, [currentTabId, isPickup, pickupDayWiseWindows, returnDayWiseWindows, selectedDate]);
  const selectTimeWindow = (time) => {
    let payload = {
      windowTimings: {
        timingsId: time.timingsId,
        deliveryWindow: time.value,
      },
    };
    dispatch(setSelectedTimeWindowAction(payload));
  };

  return (
    <Flex {...styles.timeContainer}>
      {windowsTimings?.length ? (
        windowsTimings.map((time) => (
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
            </Flex>
          </ToggleButton>
        ))
      ) : (
        <Text>
          {loading
            ? "Loading. Please wait..."
            : selectedDate
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
