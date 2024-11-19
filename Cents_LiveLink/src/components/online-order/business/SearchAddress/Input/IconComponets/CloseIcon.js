import {InputAdornment} from "@material-ui/core";
import {Image} from "rebass";
import closeIcon from "../../icons/close.svg";

const CloseIcon = ({onClick}) => {
  return (
    <InputAdornment position="end" style={{cursor: "pointer", margin: 0}}>
      <Image
        src={closeIcon}
        style={{width: 20}}
        onClick={(event) => {
          onClick();
          event.stopPropagation();
        }}
      />
    </InputAdornment>
  );
};

export default CloseIcon;
