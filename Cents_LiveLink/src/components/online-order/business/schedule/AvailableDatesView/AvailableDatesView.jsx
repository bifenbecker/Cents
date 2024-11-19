import {useEffect, useState, useMemo, useCallback} from "react";
import {DateTime} from "luxon";
import {useSelector} from "react-redux";
import {Typography, Tabs, Tab} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import {isToday} from "components/common/order-sections/delivery-windows/service-provider-time-selection/utils";
import {AvailableDatesList} from "../AvailableDatesList";
import {useWindowsPerDay} from "hooks/schedule/useWindowsPerDay";
import {useAppDispatch} from "app/hooks";
import {onlineOrderActions} from "components/online-order/redux";
import {getScheduleDetails} from "components/online-order/redux/selectors";
import IconBack from "assets/images/Icon_Back.svg";
import IconForward from "assets/images/Icon_Open_Option.svg";
import Calendar from "assets/images/Calendar.svg";
import DoorDashFrame from "assets/images/DoorDashFrame.svg";
import DoorDashIcon from "assets/images/Icon_DoorDash_With_Title.svg";
import {DELIVERY_TYPE_KEYS, NAMED_DAYS, SCHEDULE_TABS, VIEWS} from "constants/order";

export const AvailableDatesView = ({
  selectedTime,
  chooseTime,
  setIsMainButtonDisabled,
}) => {
  const {deliveryDays, haveOwn, haveOnDemand, isPickup} = useWindowsPerDay();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const {pickupDayIndex, returnDayIndex} = useSelector(getScheduleDetails);
  const dayIndex = isPickup ? pickupDayIndex : returnDayIndex;
  const [tabName, setTabName] = useState();
  const chosenDate = DateTime.fromISO(deliveryDays[dayIndex].date);
  const windows = useMemo(
    () => (tabName ? deliveryDays[dayIndex][tabName] : []),
    [dayIndex, deliveryDays, tabName]
  );
  const haveWindowsAction = useCallback(
    (type, dayIndex) => {
      if (deliveryDays[dayIndex][type].length) {
        chooseTime(deliveryDays[dayIndex][type][0]);
        setIsMainButtonDisabled(false);
      } else {
        setIsMainButtonDisabled(true);
      }
    },
    [chooseTime, deliveryDays, setIsMainButtonDisabled]
  );

  const updateStateAfterChanges = useCallback(
    (dayIndex) => {
      setTabName(haveOwn ? DELIVERY_TYPE_KEYS.OWN : DELIVERY_TYPE_KEYS.ON_DEMAND);
      haveWindowsAction(
        haveOwn ? DELIVERY_TYPE_KEYS.OWN : DELIVERY_TYPE_KEYS.ON_DEMAND,
        dayIndex
      );
    },
    [haveOwn, haveWindowsAction]
  );

  const setNextDay = () => {
    const nextDayIndex = dayIndex + 1 === deliveryDays.length ? 0 : dayIndex + 1;
    dispatch(
      isPickup
        ? onlineOrderActions.setPickupDayIndex(nextDayIndex)
        : onlineOrderActions.setReturnDayIndex(nextDayIndex)
    );
    updateStateAfterChanges(nextDayIndex);
  };

  const setPreviousDay = () => {
    const prevDayIndex = dayIndex - 1 === -1 ? deliveryDays.length - 1 : dayIndex - 1;
    dispatch(
      isPickup
        ? onlineOrderActions.setPickupDayIndex(prevDayIndex)
        : onlineOrderActions.setReturnDayIndex(prevDayIndex)
    );
    updateStateAfterChanges(prevDayIndex);
  };

  const changeTab = (event, newValue) => {
    setTabName(newValue);
    haveWindowsAction(newValue, dayIndex);
  };

  useEffect(() => {
    if (!tabName) {
      setTabName(haveOwn ? DELIVERY_TYPE_KEYS.OWN : DELIVERY_TYPE_KEYS.ON_DEMAND);
      haveWindowsAction(
        haveOwn ? DELIVERY_TYPE_KEYS.OWN : DELIVERY_TYPE_KEYS.ON_DEMAND,
        dayIndex
      );
    }
  }, [dayIndex, haveOwn, haveWindowsAction, tabName]);

  const openAllDates = () => {
    dispatch(
      onlineOrderActions.setStage(
        isPickup ? VIEWS.AVAILABLE_PICKUP_DATES : VIEWS.AVAILABLE_RETURN_DATES
      )
    );
  };

  return (
    <>
      {chosenDate && deliveryDays && (
        <div className="available-dates-container">
          <div className="date-controls-container">
            <div className="controls">
              <img
                src={IconBack}
                onClick={setPreviousDay}
                className={`${theme.filterClass} controls-img`}
              />
              <div className="date-title-container">
                <img src={Calendar} alt="Calendar" className={theme.filterClass} />
                <div className="date-title" onClick={openAllDates}>
                  <Typography variant="subtitle1" align="center" component="h2">
                    {isToday(chosenDate, deliveryDays[dayIndex]?.timeZone)
                      ? NAMED_DAYS.today
                      : chosenDate.toFormat("ccc")}
                  </Typography>
                  <Typography variant="subtitle1" align="center" className="date">
                    {chosenDate.toFormat("LLL dd")}
                  </Typography>
                </div>
              </div>
              <img
                src={IconForward}
                onClick={setNextDay}
                className={`${theme.filterClass} controls-img`}
              />
            </div>
          </div>
          <div className="windows-container">
            {!!haveOwn && !!haveOnDemand && (
              <Tabs
                value={tabName || DELIVERY_TYPE_KEYS.OWN}
                indicatorColor="primary"
                textColor="primary"
                onChange={changeTab}
                className="tabs-container"
                variant="fullWidth"
              >
                <Tab label={SCHEDULE_TABS.economy} value={DELIVERY_TYPE_KEYS.OWN} />
                <Tab
                  label={
                    <>
                      <img src={DoorDashIcon} alt="DoorDash" />
                      {SCHEDULE_TABS.flexPickup}
                    </>
                  }
                  value={DELIVERY_TYPE_KEYS.ON_DEMAND}
                />
              </Tabs>
            )}
            {!!haveOnDemand && !haveOwn && (
              <div className="door-dash-logo-container">
                <img src={DoorDashFrame} alt="DoorDash image" />
              </div>
            )}
            <div
              className={`window-selection-container ${
                !haveOnDemand && haveOwn ? "window-selection-container-only-own" : ""
              }`}
            >
              <AvailableDatesList
                windows={windows}
                chooseTime={chooseTime}
                selectedTime={selectedTime}
                tabName={tabName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
