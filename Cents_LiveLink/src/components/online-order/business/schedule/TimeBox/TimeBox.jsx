import {Typography} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import DoorDashIcon from "assets/images/Icon_DoorDash_With_Title.svg";
import {DELIVERY_PROVIDERS} from "constants/order";

export const TimeBox = ({
  boxData: {
    display: {displayDate: date, price, endTime, startTime},
    type,
    key,
  },
  boxData,
  chooseTime,
  selectedTime,
}) => {
  const theme = useTheme();

  const time = `${startTime}-${endTime}`;

  const selectAdditionalTime = () => {
    chooseTime(boxData);
  };

  const isSelectedTime = selectedTime === key;

  return (
    <>
      <div
        data-item="true"
        className="time-box window-box"
        onClick={selectAdditionalTime}
        style={isSelectedTime ? {borderColor: theme.palette.primary.main} : {}}
      >
        <div className="time-details">
          <Typography variant="h4" className="day">
            {date}
          </Typography>
          <Typography variant="subtitle2" className="time text-primary">
            {time}
          </Typography>
        </div>
        <div className="delivery-details">
          <Typography variant="h5" className="price">
            {price}
          </Typography>
          {type === DELIVERY_PROVIDERS.doorDash ? (
            <img src={DoorDashIcon} alt="DoorDash" />
          ) : null}
        </div>
      </div>
    </>
  );
};
