import {useState} from "react";
import {useSelector} from "react-redux";
import {useHistory} from "react-router";
import {useRouteMatch} from "react-router-dom";
import {DateTime} from "luxon";
import {Close} from "@material-ui/icons";
import {Button, Grid, IconButton, Typography} from "@material-ui/core";
import {Dropdown} from "components/common";
import {useAppDispatch} from "app/hooks";
import {onlineOrderActions} from "components/online-order/redux";
import {
  getNearStoresData,
  getScheduleDetails,
  onlineOrderSelectors,
} from "components/online-order/redux/selectors";
import {setOnlineOrderState} from "utils/schedule/setOnlineOrderHookState";
import Bags from "assets/images/grayscale/Joining Cents Network.svg";
import {SCHEDULE, SCHEDULE_BUTTONS, TEXT_ME_WHEN_READY, VIEWS} from "constants/order";
import {INTERVAL_DISPLAY} from "constants/subscriptions";
import {ORDER_MESSAGES} from "constants/order";
import {ORDER_DELIVERY_TYPES} from "constants/order";

export const CreateSubscriptionPopupModal = ({onScheduleDelivery}) => {
  const dispatch = useAppDispatch();
  const {url} = useRouteMatch();
  const history = useHistory();
  const [selectedInterval, setSelectedInterval] = useState(2);
  const state = useSelector(onlineOrderSelectors.getOnlineOrderData);
  const {pickup, returnInfo} = useSelector(getScheduleDetails);
  const {data: availableStores} = useSelector(getNearStoresData);
  const discount =
    availableStores?.ownDeliveryStore?.recurringDiscountInPercent ||
    availableStores?.onDemandDeliveryStore?.recurringDiscountInPercent;
  const handleAddSubscription = () => {
    // onAddSubscription({interval: selectedInterval});
  };

  const onSkipSubscription = () => {
    setOnlineOrderState(state);
    history.push(url.replace("schedule", "new"));
  };

  const getWeekListFromObject = Object.entries(INTERVAL_DISPLAY).map(
    ([interval, display]) => {
      return {label: display, value: Number(interval)};
    }
  );

  const closeView = () => {
    dispatch(onlineOrderActions.setStage(VIEWS.RETURN_QUESTION));
  };

  const pickupStartTime = DateTime.fromISO(pickup?.startTime);
  const pickupTime = `${pickupStartTime.toFormat(
    "ccc"
  )}, ${pickup?.display.startTime.toLowerCase()} - ${pickup?.display.endTime.toLowerCase()}`;

  const returnStartTime = DateTime.fromISO(returnInfo?.startTime);
  const returnTime = returnInfo?.startTime
    ? `${returnStartTime.toFormat(
        "ccc"
      )}, ${returnInfo?.display.startTime.toLowerCase()} - ${returnInfo?.display.endTime.toLowerCase()}`
    : TEXT_ME_WHEN_READY;

  return (
    <div className="recurring-choice-container">
      <div className="close-container">
        <IconButton onClick={closeView}>
          <Close fontSize="large" alt="Dock Close" />
        </IconButton>
      </div>
      <Grid container className="title">
        <Typography variant="h1" component="h2">
          {SCHEDULE.recurringOrder}
        </Typography>
      </Grid>
      <Grid className="recurring-content">
        {discount ? (
          <Typography variant="h1" component="p" color="primary">
            {ORDER_MESSAGES.getSubscriptionDiscount(discount)}
          </Typography>
        ) : null}
        <Typography variant="h1" component="h2" color="p">
          {ORDER_MESSAGES.recurringCall}
        </Typography>
        <Grid className="subscription-details">
          <img src={Bags} alt="Bags" className="subscription-image" />
          <Dropdown
            list={getWeekListFromObject}
            onListItemClick={({value}) => setSelectedInterval(value)}
            selectedListItem={selectedInterval}
          />
          <div className="pickup">
            <Typography>{SCHEDULE.pickup}</Typography>
            <Typography className="date">{pickupTime}</Typography>
          </div>

          <div className="return">
            <Typography>{SCHEDULE.delivery}</Typography>
            <Typography className="date">{returnTime}</Typography>
          </div>

          <div className="edit-container">
            {returnTime === TEXT_ME_WHEN_READY ? (
              <Typography
                color="primary"
                onClick={() => onScheduleDelivery(ORDER_DELIVERY_TYPES.return)}
              >
                {SCHEDULE_BUTTONS.scheduleDeliveryNow}
              </Typography>
            ) : (
              <Typography
                color="primary"
                onClick={() => onScheduleDelivery(ORDER_DELIVERY_TYPES.pickup)}
              >
                {SCHEDULE_BUTTONS.editScheduling}
              </Typography>
            )}
          </div>
        </Grid>
        <Typography className="pickup-reminder">
          {ORDER_MESSAGES.pickupReminder}
        </Typography>
      </Grid>
      <Grid container className="recurring-controls">
        <Button
          variant="outlined"
          color="primary"
          className="schedule-button subscription-skip"
          onClick={onSkipSubscription}
        >
          {SCHEDULE_BUTTONS.notNow}
        </Button>
        <Button
          variant="contained"
          color="primary"
          className="schedule-button subscription-apply"
          onClick={handleAddSubscription}
        >
          {SCHEDULE_BUTTONS.apply}
        </Button>
      </Grid>
    </div>
  );
};
