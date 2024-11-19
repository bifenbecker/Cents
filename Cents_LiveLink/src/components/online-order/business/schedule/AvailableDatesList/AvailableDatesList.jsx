import {TimeBox} from "../TimeBox";
import {DELIVERY_TYPE_KEYS, ORDER_MESSAGES} from "constants/order";
import {Typography} from "@material-ui/core";

export const AvailableDatesList = ({windows, chooseTime, selectedTime, tabName}) => (
  <>
    {windows.length ? (
      windows.map((window) => {
        return (
          <TimeBox
            key={window.key}
            boxData={window}
            chooseTime={chooseTime}
            selectedTime={selectedTime}
          />
        );
      })
    ) : (
      <div className="no-available-windows">
        <Typography className="empty-windows-title">{ORDER_MESSAGES.noTimes}</Typography>
        <Typography>
          {tabName === DELIVERY_TYPE_KEYS.OWN
            ? ORDER_MESSAGES.trySelectFlex
            : ORDER_MESSAGES.trySelectEconomy}
        </Typography>
      </div>
    )}
  </>
);
