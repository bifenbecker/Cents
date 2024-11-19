import {FormControlLabel, Checkbox, Typography} from "@material-ui/core";
import {CheckCircle} from "@material-ui/icons";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import {CHECKBOX_LABEL} from "./constants";

const FormControl = ({setIsLeaveAtDoor, isLeaveAtDoor, labelClassName}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          icon={<RadioButtonUncheckedIcon />}
          checkedIcon={<CheckCircle />}
          color="primary"
          onChange={(e) => {
            const {checked} = e.target;
            setIsLeaveAtDoor((prev) => ({
              ...prev,
              new: checked,
            }));
          }}
          style={{
            padding: 0,
            margin: "0 11px 0 0",
          }}
          checked={isLeaveAtDoor.new || false}
        />
      }
      label={<Typography className={labelClassName}>{CHECKBOX_LABEL}</Typography>}
      style={{margin: "25px 0"}}
    />
  );
};

export default FormControl;
