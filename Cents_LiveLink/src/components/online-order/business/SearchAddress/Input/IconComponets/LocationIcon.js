import {InputAdornment} from "@material-ui/core";
import {Image} from "rebass";
import locationIcon from "../../icons/location.svg";

const LocationIcon = () => {
  return (
    <InputAdornment position="start" style={{margin: 0, padding: 0}}>
      <Image src={locationIcon} style={{width: 15, height: 18}} />
    </InputAdornment>
  );
};

export default LocationIcon;
