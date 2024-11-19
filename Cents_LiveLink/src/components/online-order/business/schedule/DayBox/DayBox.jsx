import {DateTime} from "luxon";
import {Typography} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";

export const DayBox = ({onClick, day, selectedDate}) => {
  const theme = useTheme();

  const dayObject = DateTime.fromISO(day.date);
  const dayName = dayObject.toFormat("cccc");
  const date = dayObject.toFormat("LLL dd");
  const isSelectedTime = selectedDate === day.date;
  return (
    <>
      <div
        data-item="true"
        className="time-box window-box"
        style={isSelectedTime ? {borderColor: theme.palette.primary.main} : {}}
        onClick={onClick}
      >
        <div className="time-details">
          <Typography variant="subtitle2" className="time text-primary">
            {dayName}
          </Typography>
        </div>
        <div className="date">
          <Typography variant="h5">{date}</Typography>
        </div>
      </div>
    </>
  );
};
