import {makeStyles} from "@material-ui/styles";
import {Box} from "@material-ui/core";
import PlacesAutocomplete from "react-places-autocomplete";
import Input from "./Input";
import ListSuggestions from "./ListSuggestions";
import AddressSuggestion from "./AddressSuggestion";
import {useMediaQuery} from "@material-ui/core";

const useStyles = makeStyles(() => ({
  autoComplete: {
    width: "100%",
    padding: 0,
    zIndex: 10,
    backgroundColor: "white",
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  border: {
    borderRadius: "0 0 12px 12px",
  },
  shadow: {
    boxShadow:
      "0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 5px 5px -3px rgba(0, 0, 0, 0.2)",
  },
  staticInputWrapper: {
    "@media (max-width: 500px)": {
      width: "100%",
      position: "relative",
    },
    "@media (min-width: 500px)": {
      width: 375,
      maxWidth: 375,
      position: "absolute",
      minHeight: 88,
    },
  },
}));

const AutoComplete = ({
  address,
  onChange,
  onSelect,
  onClose,
  isInputActive,
  toggleInputActive,
  isCheckingAddress,
  onClickItem = null,
  savedAddresses = null,
  setIsCanPickupAddress = null,
  setIsSelectAddress = null,
  loadingId = null,
}) => {
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 500px)");

  const placeholderClick = (addressName) => {
    if (!isMobile) {
      toggleInputActive(false);
    }
    onSelect({
      isNew: true,
      details: {},
      name: addressName,
    });
  };

  const placeholderOnChange = (addressName) => {
    onChange(addressName);
    toggleInputActive(true);
  };

  const handleClickInput = () => {
    if (!isInputActive) {
      toggleInputActive(true);
      onChange("");
      if (setIsCanPickupAddress) {
        setIsCanPickupAddress(false);
      }
      if (setIsSelectAddress) {
        setIsSelectAddress(false);
      }
    }

    if (isMobile) {
      onChange("");
      if (setIsCanPickupAddress) {
        setIsCanPickupAddress(false);
      }
      if (setIsSelectAddress) {
        setIsSelectAddress(false);
      }
    }
  };

  return (
    <PlacesAutocomplete
      value={address.name}
      onChange={placeholderOnChange}
      onSelect={placeholderClick}
    >
      {({getInputProps, suggestions, getSuggestionItemProps}) => (
        <>
          <Box
            id="auto-complete-wrapper"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0)",
              height: "100vh",
              width: "100vw",
              top: 0,
              left: 0,
              display: isInputActive && !isMobile ? "block" : "none",
              zIndex: 8,
              position: "absolute",
            }}
            onClick={() => {
              toggleInputActive(false);
            }}
          />
          <Box className={classes.staticInputWrapper}>
            <Input
              isInputActive={isInputActive}
              text={address.name}
              toggleInputActive={toggleInputActive}
              getInputProps={getInputProps}
              onChange={onChange}
              onClose={onClose}
              handleClick={handleClickInput}
              isCheckingAddress={isCheckingAddress}
            />
            <Box
              className={[
                classes.autoComplete,
                isInputActive && !isMobile ? classes.shadow : null,
                isInputActive && !isMobile ? classes.border : null,
              ]}
              id="suggestions-wrapper"
            >
              {savedAddresses && (address.name === "" || loadingId !== -1)
                ? savedAddresses
                : isInputActive && (
                    <ListSuggestions
                      suggestions={suggestions.slice(0, 4)}
                      getSuggestionItemProps={getSuggestionItemProps}
                      onClickItem={onClickItem}
                      loadingId={loadingId}
                    >
                      <AddressSuggestion />
                    </ListSuggestions>
                  )}
            </Box>
          </Box>
        </>
      )}
    </PlacesAutocomplete>
  );
};

export default AutoComplete;
