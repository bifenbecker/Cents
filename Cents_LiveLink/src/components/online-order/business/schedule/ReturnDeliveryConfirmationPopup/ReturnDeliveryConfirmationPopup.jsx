import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Button, Typography, IconButton, CircularProgress} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {
  getNearStoresData,
  getReturnWindowsState,
  getScheduleDetails,
} from "components/online-order/redux/selectors";
import {useAppDispatch} from "app/hooks";
import {onlineOrderActions, onlineOrderThunks} from "components/online-order/redux";
import VanImg from "assets/images/grayscale/Van.svg";
import TurnAroundImg from "assets/images/grayscale/Turnaround Time.svg";
import {ORDER_MESSAGES, SCHEDULE, TEXT_ME_WHEN_READY, VIEWS} from "constants/order";
import {FETCHING_STATUS} from "constants/api";

export const ReturnDeliveryConfirmationPopup = () => {
  const dispatch = useAppDispatch();
  const {
    data: {onDemandDeliveryStore, ownDeliveryStore, address},
  } = useSelector(getNearStoresData);
  const {pickup, selectedServices} = useSelector(getScheduleDetails);
  const {fetchingStatus: returnLoadingStatus} = useSelector(getReturnWindowsState);
  const [isLoadingReturn, setIsLoadingReturn] = useState(false);

  const closeView = () => {
    dispatch(onlineOrderActions.setStage(VIEWS.RECOMMENDED_PICKUP));
  };

  const turnAroundInHours =
    onDemandDeliveryStore?.turnAroundInHours || ownDeliveryStore?.turnAroundInHours;

  const onScheduleNowClick = () => {
    dispatch(
      onlineOrderThunks.getReturnWindows({
        windowsEndTime: pickup?.endTime,
        timeZone: pickup?.timeZone,
        storeId: ownDeliveryStore?.storeId || onDemandDeliveryStore?.storeId,
        zipCode: pickup?.zipCode,
        selectedServices,
        address,
      })
    );
  };

  const onScheduleLaterClick = () => {
    dispatch(onlineOrderActions.setStage(VIEWS.SUBSCRIPTION_OFFER));
  };

  useEffect(() => {
    if (returnLoadingStatus === FETCHING_STATUS.PENDING) {
      setIsLoadingReturn(true);
    }

    if (
      isLoadingReturn &&
      (returnLoadingStatus === FETCHING_STATUS.FULFILLED ||
        returnLoadingStatus === FETCHING_STATUS.REJECTED)
    ) {
      dispatch(onlineOrderActions.setStage(VIEWS.RECOMMENDED_RETURN));
      setIsLoadingReturn(false);
    }
  }, [dispatch, isLoadingReturn, returnLoadingStatus]);

  return (
    <div className="return-choice-container">
      <div className="close-container">
        <IconButton onClick={closeView}>
          <Close fontSize="large" />
        </IconButton>
      </div>
      <div className="title">
        <Typography variant="h1" component="h2">
          {SCHEDULE.returnDelivery}
        </Typography>
      </div>
      <div className="return-choice-content">
        <div className="choice-block">
          <div className="content">
            <Typography variant="h1" component="h2">
              {ORDER_MESSAGES.scheduleNow}
            </Typography>
            <img src={VanImg} alt="Van" />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={onScheduleNowClick}
            className="schedule-button pop-up-button"
            startIcon={
              isLoadingReturn ? <CircularProgress color="inherit" size={14} /> : null
            }
          >
            {ORDER_MESSAGES.scheduleDeliveryNow}
          </Button>
        </div>
        <div className="choice-block">
          <div className="content">
            <Typography variant="h1" component="h2">
              {TEXT_ME_WHEN_READY} (
              {ORDER_MESSAGES.getTurnAroundInHours(turnAroundInHours)})
            </Typography>
            <img src={TurnAroundImg} alt="Turn Around" />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={onScheduleLaterClick}
            className="schedule-button pop-up-button"
          >
            {ORDER_MESSAGES.scheduleDeliveryLater}
          </Button>
        </div>
      </div>
    </div>
  );
};
