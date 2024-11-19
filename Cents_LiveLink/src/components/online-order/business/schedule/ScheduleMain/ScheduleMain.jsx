import {useState, useEffect, useRef} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import {useSelector} from "react-redux";
import {CSSTransition} from "react-transition-group";
import {IconButton, Typography, Grid, Button} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {getNearStoresData, getCurrentView} from "components/online-order/redux/selectors";
import {onlineOrderActions} from "components/online-order/redux";
import {DateSelector} from "../DateSelector";
import {ReturnDeliveryConfirmationPopup} from "../ReturnDeliveryConfirmationPopup/";
import {CreateSubscriptionPopupModal} from "../CreateSubscriptionPopupModal";
import {AvailableDatesView} from "../AvailableDatesView/AvailableDatesView";
import {RecommendedWindows} from "../RecommendedWindows";
import {useAppDispatch} from "app/hooks";
import {FETCHING_STATUS} from "constants/api";
import {SCHEDULE, TRANSITION_TIME, VIEWS} from "constants/order";

export const ScheduleMain = () => {
  const history = useHistory();
  const {fetchingStatus, data: availableStores} = useSelector(getNearStoresData);
  const {url} = useRouteMatch();
  const dispatch = useAppDispatch();

  const [selectedTime, setSelectedTime] = useState(0);
  const [isMainButtonDisabled, setIsMainButtonDisabled] = useState(true);

  const allWindowsRef = useRef(null);
  const scheduleRef = useRef(null);
  const recommendedRef = useRef(null);
  const createSubscriptionRef = useRef(null);
  const chooseReturnRef = useRef(null);
  const datesRef = useRef(null);

  const currentView = useSelector(getCurrentView);
  const isPickup = [
    VIEWS.ALL_WINDOWS_PICKUP,
    VIEWS.RECOMMENDED_PICKUP,
    VIEWS.AVAILABLE_PICKUP_DATES,
  ].includes(currentView);

  const choosingWindowsTitle = isPickup ? SCHEDULE.pickupTitle : SCHEDULE.returnDelivery;
  const choosingWindowsButton = isPickup
    ? SCHEDULE.setPickupTime
    : SCHEDULE.setReturnTime;

  const showAllWindows = [VIEWS.ALL_WINDOWS_PICKUP, VIEWS.ALL_WINDOWS_RETURN].includes(
    currentView
  );

  const chooseTime = (data) => {
    const timeZone = availableStores?.deliveryDays[0]?.timeZone;
    const zipCode = availableStores?.deliveryDays[0]?.customerZipCode;
    setSelectedTime(data.key);
    setIsMainButtonDisabled(false);
    if (isPickup) {
      dispatch(onlineOrderActions.setPickupInfo({timeZone, zipCode, ...data}));
    } else {
      dispatch(onlineOrderActions.setReturnInfo({timeZone, zipCode, ...data}));
    }
  };

  const setPickupTime = () => {
    dispatch(
      onlineOrderActions.setStage(
        isPickup ? VIEWS.RETURN_QUESTION : VIEWS.SUBSCRIPTION_OFFER
      )
    );
  };

  const toOrderStart = () => {
    history.goBack();
  };

  const closeView = () => {
    if (currentView === VIEWS.RECOMMENDED_PICKUP) {
      toOrderStart();
    } else if (currentView === VIEWS.ALL_WINDOWS_PICKUP) {
      dispatch(onlineOrderActions.setStage(VIEWS.RECOMMENDED_PICKUP));
    } else if (currentView === VIEWS.ALL_WINDOWS_RETURN) {
      dispatch(onlineOrderActions.setStage(VIEWS.RECOMMENDED_RETURN));
    } else if (currentView === VIEWS.RECOMMENDED_RETURN) {
      dispatch(onlineOrderActions.setStage(VIEWS.RETURN_QUESTION));
    }
  };

  useEffect(() => {
    if (fetchingStatus !== FETCHING_STATUS.FULFILLED) {
      history.push(url.replace("/schedule", ""));
    }
  });

  const showWindowChoosing = [
    VIEWS.RECOMMENDED_PICKUP,
    VIEWS.ALL_WINDOWS_PICKUP,
    VIEWS.RECOMMENDED_RETURN,
    VIEWS.ALL_WINDOWS_RETURN,
  ].includes(currentView);

  const showRecommendedWindows = [
    VIEWS.RECOMMENDED_PICKUP,
    VIEWS.RECOMMENDED_RETURN,
  ].includes(currentView);

  const showAvailableDates = [
    VIEWS.AVAILABLE_PICKUP_DATES,
    VIEWS.AVAILABLE_RETURN_DATES,
  ].includes(currentView);

  return (
    <>
      {fetchingStatus === FETCHING_STATUS.FULFILLED ? (
        <div className="schedule-container">
          <div className="slide-view-wrapper">
            <CSSTransition
              in={showWindowChoosing}
              timeout={TRANSITION_TIME}
              classNames="prev-slide-view"
              unmountOnExit
              nodeRef={scheduleRef}
            >
              <div className="main-view prev-slide-view" ref={scheduleRef}>
                <div className="close-container">
                  <IconButton onClick={closeView}>
                    <Close fontSize="large" />
                  </IconButton>
                </div>
                <div className="title">
                  <Typography variant="h1" component="h2">
                    {choosingWindowsTitle}
                  </Typography>
                </div>
                <div className="schedule-content">
                  <CSSTransition
                    in={showRecommendedWindows}
                    timeout={TRANSITION_TIME}
                    classNames="prev-slide-view"
                    unmountOnExit
                    nodeRef={allWindowsRef}
                  >
                    <div ref={allWindowsRef} className="recommended-container">
                      <RecommendedWindows
                        selectedTime={selectedTime}
                        chooseTime={chooseTime}
                        setIsMainButtonDisabled={setIsMainButtonDisabled}
                      />
                    </div>
                  </CSSTransition>
                  <CSSTransition
                    in={showAllWindows}
                    timeout={TRANSITION_TIME}
                    classNames="next-slide-view"
                    unmountOnExit
                    nodeRef={recommendedRef}
                  >
                    <div
                      className={"available-dates next-slide-view"}
                      ref={recommendedRef}
                    >
                      <AvailableDatesView
                        selectedTime={selectedTime}
                        chooseTime={chooseTime}
                        setIsMainButtonDisabled={setIsMainButtonDisabled}
                      />
                    </div>
                  </CSSTransition>
                </div>
                <Grid container className="schedule-controls">
                  <Button
                    color="primary"
                    variant="contained"
                    className="schedule-button"
                    onClick={setPickupTime}
                    disabled={isMainButtonDisabled}
                  >
                    {choosingWindowsButton}
                  </Button>
                </Grid>
              </div>
            </CSSTransition>
            <CSSTransition
              in={showAvailableDates}
              timeout={TRANSITION_TIME}
              classNames="next-slide-view"
              unmountOnExit
              nodeRef={datesRef}
            >
              <div className={"available-dates next-slide-view"} ref={datesRef}>
                <DateSelector isPickup={isPickup} />
              </div>
            </CSSTransition>
            <CSSTransition
              in={currentView === VIEWS.RETURN_QUESTION}
              timeout={TRANSITION_TIME}
              classNames="next-slide-view"
              unmountOnExit
              nodeRef={chooseReturnRef}
            >
              <div className={"next-slide-view"} ref={chooseReturnRef}>
                <ReturnDeliveryConfirmationPopup isPickup={isPickup} />
              </div>
            </CSSTransition>
            <CSSTransition
              in={currentView === VIEWS.SUBSCRIPTION_OFFER}
              timeout={TRANSITION_TIME}
              classNames="next-slide-view"
              unmountOnExit
              nodeRef={createSubscriptionRef}
            >
              <div className={"next-slide-view"} ref={createSubscriptionRef}>
                <CreateSubscriptionPopupModal
                  selectedTime={selectedTime}
                  chooseTime={chooseTime}
                  setIsMainButtonDisabled={setIsMainButtonDisabled}
                />
              </div>
            </CSSTransition>
          </div>
        </div>
      ) : null}
    </>
  );
};
