import React, {useContext, useMemo} from "react";
import {Flex, Text} from "rebass/styled-components";

import {getEarliestDeliveryStartTime, isSameDay, isToday} from "./utils";
import {setSelectedDateAction} from "./actions";
import WindowsSelectionDispatch from "./context";
import {DateTime} from "luxon";
import {DELIVERY_PROVIDERS} from "../../../../../constants/order";
import OrderDeliveryAutoSchedulerBase from "../../../../../services/order-delivery-auto-scheduler/base";
import {NAMED_DAYS} from "constants/order";

const DayItem = ({date, selectedDate, timeZone, setSelectedDate}) => {
  const handleDateSelection = () => {
    setSelectedDate(date);
  };

  return (
    <Flex
      onClick={handleDateSelection}
      sx={{
        ...styles.individualDayContainer,
        borderWidth: isSameDay(date, selectedDate, timeZone) ? 4 : 1,
        borderColor: isSameDay(date, selectedDate, timeZone) ? "primary" : "#B1B1B1",
      }}
    >
      <Text {...styles.dayOfWeek}>
        {isToday(date, timeZone) ? NAMED_DAYS.today : date.toFormat("ccc")?.toUpperCase()}
      </Text>
      <Text {...styles.dayOfWeek}>
        {date.toFormat("LLL")} {date.day}
      </Text>
    </Flex>
  );
};

const DaySelection = (props) => {
  const {currentTabId, selectedDate, state, storeSettings} = props;

  const {dispatch} = useContext(WindowsSelectionDispatch);

  const {
    isPickup,
    timeZone,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    orderDelivery,
    pickupDayWiseWindows,
    returnDayWiseWindows,
  } = state;

  const setSelectedDate = ({selectedDate}) => {
    dispatch(
      setSelectedDateAction({
        selectedDate,
      })
    );
  };

  const dayWiseWindows = useMemo(() => {
    const daysToShow = isPickup ? pickupDayWiseWindows : returnDayWiseWindows;
    const minTime = isPickup
      ? DateTime.local().setZone(timeZone)
      : getEarliestDeliveryStartTime({
          timeZone,
          isProcessingCompleted,
          intakeCompletedAtInMillis,
          turnAroundInHours,
          orderDelivery,
        });
    return daysToShow
      .filter(
        ({date}) =>
          !isSameDay(date, DateTime.local(), timeZone) ||
          (currentTabId === DELIVERY_PROVIDERS.ownDriver
            ? !!OrderDeliveryAutoSchedulerBase.getFirstAvailableOwnDriverWindow({
                date,
                dayWiseWindows: daysToShow,
                timeZone,
                minimumTime: minTime,
                includeBuffer: isPickup || isProcessingCompleted,
                bufferTimeInHours:
                  storeSettings?.deliveryWindowBufferInHours ||
                  storeSettings?.ownDeliverySettings?.deliveryWindowBufferInHours,
              })
            : OrderDeliveryAutoSchedulerBase.getFirstAvailableOnDemandWindow({
                date,
                dayWiseWindows: daysToShow,
                timeZone,
                minimumTime: minTime,
                includeBuffer: isPickup || isProcessingCompleted,
              }))
      )
      ?.filter((dayWiseWindows) => dayWiseWindows?.timings?.length);
  }, [
    currentTabId,
    intakeCompletedAtInMillis,
    isPickup,
    isProcessingCompleted,
    orderDelivery,
    pickupDayWiseWindows,
    returnDayWiseWindows,
    timeZone,
    turnAroundInHours,
  ]);

  return (
    <div className="scrollbarInvisible">
      <Flex {...styles.dateContainer}>
        {dayWiseWindows?.map(({date}) => (
          <DayItem
            date={date}
            key={date.day}
            timeZone={timeZone}
            selectedDate={selectedDate}
            setSelectedDate={() => setSelectedDate({selectedDate: date})}
          />
        ))}
      </Flex>
    </div>
  );
};

const styles = {
  dateContainer: {
    width: "100%",
    py: "12px",
    sx: {
      overflowX: "scroll",
    },
  },
  individualDayContainer: {
    borderStyle: "solid",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    width: 96,
    height: 82,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
    mx: "5px",
    cursor: "pointer",
  },
  dayOfWeek: {
    sx: {
      fontSize: 12,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
  },
};

export default DaySelection;
