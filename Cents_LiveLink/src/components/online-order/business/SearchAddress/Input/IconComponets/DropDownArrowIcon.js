import {InputAdornment} from "@material-ui/core";
import {Image} from "rebass";
import dropDownArrowIcon from "../../icons/dropdownArrow.svg";

const DropDownArrowIcon = () => {
  return (
    <InputAdornment position="end" style={{cursor: "pointer", margin: 0, padding: 0}}>
      <Image src={dropDownArrowIcon} />
    </InputAdornment>
  );
};

export default DropDownArrowIcon;
