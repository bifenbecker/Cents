import React, {useMemo} from "react";
import {DateTime} from "luxon";
import {Flex, Text} from "rebass/styled-components";

import {deliveryProviders} from "../../constants";
import {
  isToday,
  getNextDays,
  getWeekDay,
  isThirdPartyWindowAvailable,
  getFirstAvailableOwnDriverWindow,
  isSameDay,
} from "./utils";
import {getTimeFromMilliSeconds} from "../../utils";
import {NAMED_DAYS} from "constants/order";

const DayItem = ({date, selectedDate, timeZone, setSelectedDate}) => {
  return (
    <Flex
      onClick={() => {
        setSelectedDate(date);
      }}
      sx={{
        ...styles.individualDayContainer,
        borderWidth: date.day === selectedDate?.day ? 4 : 1,
        borderColor: date.day === selectedDate?.day ? "primary" : "#B1B1B1",
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
  const {
    isPickup,
    timeZone,
    currentTabId,
    selectedDate,
    dayWiseWindows,
    setSelectedDate,
    currentOrderDelivery,
    isProcessingCompleted,
    latestDeliveryStartTime,
  } = props;

  const deliveryDate = isPickup ? null : latestDeliveryStartTime;

  let nextSevenDays = dayWiseWindows?.length
    ? getNextDays(7, timeZone, deliveryDate).filter((date, index) => {
        // if the index is 0, then it is today.
        const isFirstDay = !index;
        const dayTimings = dayWiseWindows?.find(
          (timing) => `${timing.day}` === `${getWeekDay(date)}`
        )?.timings;

        if (!dayTimings) return false;

        if (isFirstDay) {
          const currentTime = isPickup
            ? DateTime.local().setZone(timeZone)
            : latestDeliveryStartTime;
          if (!currentTime) {
            return false;
          }
          if (currentTabId === deliveryProviders.ownDriver) {
            return getFirstAvailableOwnDriverWindow(
              date,
              dayTimings,
              timeZone,
              currentTime,
              {excludeBuffer: !isPickup && !isProcessingCompleted}
            )?.id;
          } else {
            const timing = dayTimings[0];
            if (!timing) return false;
            return isThirdPartyWindowAvailable(currentTime, timing, timeZone);
          }
        } else {
          return dayTimings?.length;
        }
      })
    : [];

  const weekDays = useMemo(() => {
    const startTime = (
      isPickup ? currentOrderDelivery?.pickup : currentOrderDelivery?.delivery
    )?.deliveryWindow?.[0];
    const isSameDeliveryProvider =
      currentTabId ===
      (isPickup ? currentOrderDelivery?.pickup : currentOrderDelivery?.delivery)
        ?.deliveryProvider;
    const currentStartTime = startTime
      ? getTimeFromMilliSeconds(startTime)?.setZone(timeZone)
      : null;
    let currentWeekDays = nextSevenDays || [];
    if (
      currentStartTime &&
      isSameDeliveryProvider &&
      (!nextSevenDays.length ||
        !nextSevenDays.some((day) => isSameDay(day, currentStartTime, timeZone)))
    ) {
      if (
        isPickup ||
        latestDeliveryStartTime < currentStartTime ||
        isSameDay(latestDeliveryStartTime, currentStartTime, timeZone)
      ) {
        currentWeekDays =
          nextSevenDays?.[0] &&
          currentStartTime &&
          nextSevenDays[0].startOf("day") >= currentStartTime.startOf("day")
            ? [currentStartTime.startOf("day"), ...currentWeekDays]
            : [...currentWeekDays, currentStartTime.startOf("day")];
      }
    }
    return currentWeekDays?.map((date) =>
      date
        ? {
            date,
            isPastDate:
              currentStartTime && isSameDeliveryProvider
                ? isSameDay(date, currentStartTime, timeZone)
                : false,
          }
        : null
    );
  }, [
    isPickup,
    timeZone,
    nextSevenDays,
    currentOrderDelivery,
    latestDeliveryStartTime,
    currentTabId,
  ]);

  return (
    <div className="scrollbarInvisible">
      <Flex {...styles.dateContainer}>
        {weekDays?.map(({date, isPastDate}) => (
          <DayItem
            date={date}
            key={date.day}
            timeZone={timeZone}
            selectedDate={selectedDate}
            setSelectedDate={() => setSelectedDate({selectedDate: date, isPastDate})}
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
