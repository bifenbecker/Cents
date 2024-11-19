import {useEffect, useCallback} from "react";
import {useSelector} from "react-redux";
import {DateTime} from "luxon";
import {Chip, Typography, Box, Button, Grid} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import {onlineOrderActions} from "components/online-order/redux";
import {TimeBox} from "../TimeBox";
import {useAppDispatch} from "app/hooks";
import {
  getCurrentView,
  getScheduleDetails,
} from "components/online-order/redux/selectors";
import {isToday} from "components/common/order-sections/delivery-windows/service-provider-time-selection/utils";
import {useRecommendedWindows} from "hooks/schedule/useRecommendedWindows";
import DoorDashIcon from "assets/images/Icon_DoorDash_With_Title.svg";
import Van from "assets/images/grayscale/Van.svg";
import {DELIVERY_PROVIDERS, NAMED_DAYS, SCHEDULE, VIEWS} from "constants/order";
import {IconBack} from "assets/images";

export const RecommendedWindows = ({
  selectedTime,
  chooseTime,
  setIsMainButtonDisabled,
}) => {
  const theme = useTheme();
  const {recommended: recommendedWindow, other: otherWindows} = useRecommendedWindows();
  const dispatch = useAppDispatch();
  const currentView = useSelector(getCurrentView);
  const {pickup} = useSelector(getScheduleDetails);

  const recommendedDate = recommendedWindow?.display?.displayDate;
  const recommendedWindowTime = `${recommendedWindow?.display?.startTime}-${recommendedWindow?.display?.endTime}`;
  const recommendedPrice = recommendedWindow?.display?.price;
  const isRecommendedSelected = selectedTime === recommendedWindow?.key;
  const haveAllOtherWindows = otherWindows?.every((window) => window);

  const selectRecommendedTheme = useCallback(() => {
    chooseTime(recommendedWindow);
  }, [chooseTime, recommendedWindow]);

  const openAvailableDates = () => {
    dispatch(
      onlineOrderActions.setStage(
        currentView === VIEWS.RECOMMENDED_PICKUP
          ? VIEWS.ALL_WINDOWS_PICKUP
          : VIEWS.ALL_WINDOWS_RETURN
      )
    );
  };

  useEffect(() => {
    if (recommendedWindow) {
      setIsMainButtonDisabled(false);
      selectRecommendedTheme();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedWindow]);

  const pickupStartTime = DateTime.fromISO(pickup?.startTime);
  const pickupMessage = `${
    isToday(pickupStartTime, pickup?.timeZone)
      ? NAMED_DAYS.today
      : pickupStartTime.toFormat("ccc")
  }, ${pickupStartTime.toFormat(
    "LLL. dd"
  )}, ${pickup?.display.startTime.toLowerCase()} - ${pickup?.display.endTime.toLowerCase()}`;
  const isReturn = [VIEWS.RECOMMENDED_RETURN, VIEWS.SUBSCRIPTION_OFFER].includes(
    currentView
  );
  return (
    <>
      {recommendedWindow ? (
        <>
          {isReturn ? (
            <div className="pickup-schedule-container">
              <img src={IconBack} className="icon-back" alt="Back" />
              <div className="pickup-schedule-content">
                <Typography variant="h2" className="pickup-schedule-subtitle">
                  {SCHEDULE.pickupScheduled}
                </Typography>
                <Typography variant="h2" className="pickup-schedule-date">
                  {pickupMessage}
                </Typography>
              </div>
            </div>
          ) : (
            <></>
          )}

          <Grid container>
            <Typography variant="subtitle1" component="h2" className="schedule-subtitle">
              {SCHEDULE.pickupSubTitle}
            </Typography>
          </Grid>
          <Grid container className="pickup-windows-container">
            <Box
              className="recommended-window  window-box"
              style={
                isRecommendedSelected ? {borderColor: theme.palette.primary.main} : {}
              }
              onClick={selectRecommendedTheme}
            >
              <div className="details">
                <Chip
                  label={SCHEDULE.recommended}
                  color="primary"
                  variant="outlined"
                  className="chip"
                  style={{backgroundColor: `${theme.palette.primary.main}1a`}}
                />
                <div>
                  <Typography variant="h3">{recommendedDate}</Typography>
                  <Typography variant="subtitle2" className="text-primary">
                    {recommendedWindowTime}
                  </Typography>
                </div>
                <Typography variant="h5" className="price">
                  {recommendedPrice}
                </Typography>
              </div>
              <div className="recommended-image-container">
                {recommendedWindow?.type === DELIVERY_PROVIDERS.doorDash ? (
                  <img src={DoorDashIcon} alt="DoorDash" className="doordash" />
                ) : null}
                <img src={Van} alt="Van" />
              </div>
            </Box>
            <div className="more-times-container">
              {otherWindows[0] && (
                <>
                  <Typography
                    variant="subtitle2"
                    component="h2"
                    className="schedule-subtitle"
                  >
                    {SCHEDULE.moreTimes}
                  </Typography>
                  <div className="times-container">
                    {otherWindows.map(
                      (boxData) =>
                        boxData && (
                          <TimeBox
                            key={boxData.key}
                            boxData={boxData}
                            chooseTime={chooseTime}
                            selectedTime={selectedTime}
                          />
                        )
                    )}
                  </div>
                </>
              )}

              {haveAllOtherWindows && (
                <Button
                  variant="outlined"
                  color="primary"
                  className="get-all-button"
                  onClick={openAvailableDates}
                >
                  {SCHEDULE.seeAllTimes}
                </Button>
              )}
            </div>
          </Grid>
        </>
      ) : null}
    </>
  );
};
