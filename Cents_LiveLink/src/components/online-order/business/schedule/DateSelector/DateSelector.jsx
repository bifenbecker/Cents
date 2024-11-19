import {useState} from "react";
import {useSelector} from "react-redux";
import {Button, IconButton, Typography, Grid} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {onlineOrderActions} from "components/online-order/redux";
import {DayBox} from "../DayBox";
import {getScheduleDetails} from "components/online-order/redux/selectors";
import {useWindowsPerDay} from "hooks/schedule/useWindowsPerDay";
import {useAppDispatch} from "app/hooks";
import {SCHEDULE, SCHEDULE_BUTTONS, VIEWS} from "constants/order";

export const DateSelector = ({isPickup}) => {
  const {deliveryDays} = useWindowsPerDay();
  const {pickupDayIndex, returnDayIndex} = useSelector(getScheduleDetails);
  const [selectedDate, setSelectedDate] = useState(
    deliveryDays[isPickup ? pickupDayIndex : returnDayIndex].date
  );
  const dispatch = useAppDispatch();

  const closeView = () => {
    dispatch(
      onlineOrderActions.setStage(
        isPickup ? VIEWS.ALL_WINDOWS_PICKUP : VIEWS.ALL_WINDOWS_RETURN
      )
    );
  };

  const setDate = () => {
    const selectedDay = deliveryDays.findIndex(({date}) => selectedDate === date);
    dispatch(
      isPickup
        ? onlineOrderActions.setPickupDayIndex(selectedDay)
        : onlineOrderActions.setReturnDayIndex(selectedDay)
    );
    closeView();
  };

  return (
    <div className="all-dates-container">
      <div className="close-container">
        <IconButton onClick={closeView}>
          <Close fontSize="large" />
        </IconButton>
      </div>
      <div className="title">
        <Typography variant="h1" component="h2">
          {isPickup ? SCHEDULE.selectPickupDate : SCHEDULE.selectReturnDate}
        </Typography>
      </div>
      <div className="all-dates-content">
        {deliveryDays.map((day) => {
          const onClick = () => {
            setSelectedDate(day.date);
          };
          return (
            <DayBox
              selectedDate={selectedDate}
              key={day.date}
              day={day}
              onClick={onClick}
            />
          );
        })}
      </div>
      <Grid container className="all-dates-controls">
        <Button color="primary" variant="outlined" className="cancel" onClick={closeView}>
          {SCHEDULE_BUTTONS.cancel}
        </Button>
        <Button color="primary" variant="contained" className="confirm" onClick={setDate}>
          {SCHEDULE_BUTTONS.confirm}
        </Button>
      </Grid>
    </div>
  );
};
