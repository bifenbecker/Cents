import {InputAdornment} from "@material-ui/core";
import {Image} from "rebass";
import searchIcon from "../../icons/search.svg";

const SearchIcon = () => {
  return (
    <InputAdornment position="start" style={{flex: "0 0 26px"}}>
      <Image src={searchIcon} style={{width: "100%"}} />
    </InputAdornment>
  );
};

export default SearchIcon;
