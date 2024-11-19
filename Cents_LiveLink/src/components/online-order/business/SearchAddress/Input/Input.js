import {TextField, Box, useMediaQuery} from "@material-ui/core";
import {
  SearchIcon,
  CloseIcon,
  DropDownArrowIcon,
  LocationIcon,
  LoadingIcon,
} from "./IconComponets";
import {useAppSelector} from "app/hooks";
import {onlineOrderSelectors} from "components/online-order/redux";
import {FETCHING_STATUS} from "constants/api";

import useStyle from "./styles";
import {
  SEARCH_FOR_A_NEW_ADDRESS,
  SEARCH_FOR_AN_ADDRESS,
  SEARCH_ADDRESS,
} from "./constants";

import {makeStyles} from "@material-ui/styles";

const useClasses = makeStyles({
  underline: {
    "&&&:before": {
      borderBottom: "1px solid",
    },
  },
});

const Input = ({
  text,
  toggleInputActive,
  onClose,
  onChange,
  isInputActive,
  handleClick,
  getInputProps = null,
  isCheckingAddress = false,
}) => {
  const latestAddress = useAppSelector(onlineOrderSelectors.getLatestAddress);
  const {
    data: {savedCustomerAddresses: addresses},
    fetchingStatus: statusSavedAddresses,
  } = useAppSelector(onlineOrderSelectors.getOrderInitialData);

  const inputProps = getInputProps
    ? getInputProps({
        placeholder: isInputActive
          ? addresses
            ? SEARCH_FOR_A_NEW_ADDRESS
            : SEARCH_FOR_AN_ADDRESS
          : SEARCH_ADDRESS,
      })
    : {};
  const {
    activeWrapper,
    activeInput,
    dropDownList,
    staticWrapper,
    staticInput,
    shadow,
    inputPropsStyle,
    InputPropsStyle,
    wrapperBorder,
    activeInputProps,
  } = useStyle();
  const classes = useClasses();
  const isMobile = useMediaQuery("(max-width: 500px)");

  const handleCloseIconClick = () => {
    onChange("");
    onClose();
    toggleInputActive(true);
  };

  const ENUM_END_ICON_STATES = {
    loading: <LoadingIcon />,
    close: <CloseIcon onClick={handleCloseIconClick} />,
    null: null,
  };

  const getEndIcon = () => {
    if (isMobile) {
      if (isCheckingAddress) {
        return "loading";
      } else if (text !== "") {
        return "close";
      }
    } else {
      if (statusSavedAddresses === FETCHING_STATUS.PENDING) {
        return "loading";
      } else {
        if (text !== "") {
          return "close";
        }
      }
    }
    return "null";
  };

  return (
    <Box
      id="input-wrapper"
      className={[
        staticWrapper,
        isInputActive ? activeWrapper : null,
        isInputActive && !isMobile ? wrapperBorder : null,
        isInputActive && !isMobile && Object.keys(addresses || {}).length !== 0
          ? dropDownList
          : null,
        !isMobile && isInputActive ? shadow : null,
      ]}
    >
      <TextField
        {...inputProps}
        className={[isInputActive ? activeInput : staticInput]}
        onClick={handleClick}
        inputProps={{
          className: inputPropsStyle,
        }}
        disabled={isCheckingAddress || statusSavedAddresses === FETCHING_STATUS.PENDING}
        InputProps={
          isInputActive
            ? {
                className: [InputPropsStyle, activeInputProps],
                disableUnderline: true,
                startAdornment: <SearchIcon />,
                endAdornment: ENUM_END_ICON_STATES[getEndIcon()],
              }
            : {
                classes,
                className: InputPropsStyle,
                disableUnderline: false,
                startAdornment: <LocationIcon />,
                endAdornment:
                  isCheckingAddress ||
                  statusSavedAddresses === FETCHING_STATUS.PENDING ? (
                    <LoadingIcon />
                  ) : latestAddress ? (
                    <DropDownArrowIcon />
                  ) : null,
              }
        }
        inputRef={(input) =>
          input && !isMobile && (isInputActive ? input.focus() : input.blur())
        }
      >
        {text}
      </TextField>
    </Box>
  );
};

export default Input;
