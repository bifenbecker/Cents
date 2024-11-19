import React, {useCallback, useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import {Box, Flex, Image, Text} from "rebass/styled-components";

import {SearchIcon, ExitIcon} from "../../assets/images/index";

import {getTimezoneFromLatLng} from "../../api/google";

import {TextField} from ".";

const mandatoryAddressFields = [
  "address1",
  "city",
  "countryCode",
  "firstLevelSubdivisionCode",
  "googlePlacesId",
  "postalCode",
];

const messageMapping = {
  address1: "street number and name",
  postalCode: "zip code",
  city: "city name",
  firstLevelSubdivisionCode: "state",
  countryCode: "country",
};

const isMappedAddressValid = address => {
  const invalidField = Object.keys(address)?.find(key => {
    return mandatoryAddressFields.includes(key) && !address[key];
  });
  if (invalidField) {
    let errorMessage = "";
    switch (invalidField) {
      case "address1":
      case "postalCode":
      case "city":
      case "firstLevelSubdivisionCode":
      case "countryCode":
        errorMessage = `Please include the ${messageMapping[invalidField]}`;
        break;
      case "googlePlacesId":
        errorMessage = "Something went wrong, Please try again";
        break;
      default:
        errorMessage = "Please fill in your full address";
    }
    return {isValid: false, errorMessage};
  }
  return {isValid: true};
};

const mapGoogleAddressResult = result => {
  const address = {
    googlePlacesId: result.place_id,
    address1: null,
    city: null,
    firstLevelSubdivisionCode: null,
    postalCode: null,
    countryCode: null,
  };

  const address1Fields = [
    result.address_components.find(comp => comp.types.includes("street_number"))
      ?.long_name,
    result.address_components.find(comp => comp.types.includes("route"))?.long_name,
  ].filter(v => v);

  // Both street_number and route are mandatory
  address.address1 = address1Fields.length === 2 ? address1Fields.join(" ") : null;

  address.city = result.address_components.find(
    comp =>
      comp.types.includes("locality") ||
      comp.types.includes("sublocality") ||
      comp.types.includes("administrative_area_level_3") ||
      comp.types.includes("administrative_area_level_2")
  )?.long_name;

  address.firstLevelSubdivisionCode = result.address_components.find(comp =>
    comp.types.includes("administrative_area_level_1")
  )?.short_name;

  address.postalCode = result.address_components.find(comp =>
    comp.types.includes("postal_code")
  )?.short_name;

  address.countryCode = result.address_components.find(comp =>
    comp.types.includes("country")
  )?.short_name;

  return address;
};

const getAddressAndLatLng = async address => {
  try {
    const [addressResult] = await geocodeByAddress(address);
    const latLng = await getLatLng(addressResult);
    const timeZoneRes = await getTimezoneFromLatLng(latLng);

    return {addressResult, latLng, timeZone: timeZoneRes?.data?.timeZoneId};
  } catch (error) {
    console.error("Error", error);
    throw new Error(
      error === "ZERO_RESULTS"
        ? "Address not found"
        : "Could not get relevant address details"
    );
  }
};

const AutoSuggestionList = ({
  suggestions,
  getSuggestionItemProps,
  loading,
  autocompleteError,
}) => {
  return (
    <Flex
      {...(suggestions.length || loading || autocompleteError
        ? styles.autocomplete.wrapper
        : styles.autocomplete.wrapperNoItems)}
    >
      {loading || autocompleteError ? (
        <Box {...styles.autocomplete.loading}>
          {loading ? "Loading..." : autocompleteError}
        </Box>
      ) : suggestions.length ? (
        suggestions.map(suggestion => {
          const bg = suggestion.active ? "#fafafa" : "#ffffff";

          return (
            <Box
              {...getSuggestionItemProps(suggestion, {})}
              {...styles.autocomplete.item}
              bg={bg}
              key={suggestion.index}
            >
              <Text>{suggestion.description}</Text>
            </Box>
          );
        })
      ) : null}
    </Flex>
  );
};

const GoogleAddressSearchInput = props => {
  const {
    address,
    onError,
    onLoading,
    onAddressSelect,
    onAddressChange,
    onSearchClear,
    triggerSelectOnMount,
    label,
  } = props;

  const autocompleteRef = useRef();
  const textInputRef = useRef();
  const needInitialAddressSelection = useRef(triggerSelectOnMount);

  const [autocompleteError, setAutocompleteError] = useState();
  const [mappedAddressResult, setMappedAddressResult] = useState();

  const handleSelect = useCallback(
    async address => {
      onLoading(true);
      onError();
      setAutocompleteError();
      needInitialAddressSelection.current = false;
      try {
        if (textInputRef?.current) {
          textInputRef.current.blur();
        }
        const {addressResult, latLng, timeZone} = await getAddressAndLatLng(address);

        console.log("Google Address: ", addressResult);
        const mappedAddress = mapGoogleAddressResult(addressResult);
        console.log("Mapped Address: ", mappedAddress);

        onAddressChange(address);
        setMappedAddressResult(mappedAddress);

        const {isValid, errorMessage} = isMappedAddressValid(mappedAddress);
        if (!isValid) {
          onError(errorMessage);
          return;
        }

        await onAddressSelect({
          address,
          mappedAddress,
          timeZone,
          latLng,
        });
      } catch (error) {
        onError(
          error?.response?.data?.error ||
            error?.message ||
            "Could not get selected address details"
        );
      } finally {
        onLoading(false);
      }
    },
    [onAddressChange, onAddressSelect, onError, onLoading]
  );

  useEffect(() => {
    if (!mappedAddressResult && address && needInitialAddressSelection.current) {
      // This is used to select an address and trigger onAddressSelect and onAddressChange,
      // if there is a default address added.
      handleSelect(address);
    }
  }, [address, mappedAddressResult, handleSelect]);

  const handleChange = address => {
    needInitialAddressSelection.current = false;
    onAddressChange(address);
    onError();
    setAutocompleteError();
  };

  const handleSearchClear = () => {
    onAddressChange("");
    onError();
    setAutocompleteError();
    onSearchClear();
    if (autocompleteRef?.current?.clearSuggestions) {
      autocompleteRef.current.clearSuggestions();
    }
  };

  const onInputFocus = () => {
    if (address) {
      if (autocompleteRef?.current?.debouncedFetchPredictions) {
        onError();
        setAutocompleteError();
        autocompleteRef.current.debouncedFetchPredictions();
      } else {
        onError("Could not search. Please select from the suggestions.");
      }
    } else {
      handleSearchClear();
    }
  };

  const handleAutocompleteError = error => {
    if (error === "ZERO_RESULTS") {
      setAutocompleteError("Address not found");
    } else {
      setAutocompleteError("Could not get address results. Please try again");
    }
  };

  const clearAutocompleteError = () => {
    setAutocompleteError();
  };

  return (
    <PlacesAutocomplete
      highlightFirstSuggestion
      value={address}
      onChange={handleChange}
      onSelect={handleSelect}
      ref={autocompleteRef}
      searchOptions={{types: ["address"], componentRestrictions: {country: "us"}}}
      onError={handleAutocompleteError}
    >
      {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
        <Flex {...styles.googlePlaces.wrapper}>
          <Flex {...styles.googlePlaces.textWrapper}>
            <TextField
              {...getInputProps({
                onFocus: onInputFocus,
                onBlur: clearAutocompleteError,
              })}
              ref={textInputRef}
              label={label || "Enter Your Address"}
              prefix={<Image src={SearchIcon} />}
              type="text"
              suffix={
                address && (
                  <Image
                    onClick={handleSearchClear}
                    src={ExitIcon}
                    {...styles.googlePlacesTextField.suffix}
                  />
                )
              }
              materialWrapperStyle={styles.googlePlacesTextField.materialWrapper}
              wrapperInputStyle={styles.googlePlacesTextField.input}
            />
            <AutoSuggestionList
              {...{suggestions, getSuggestionItemProps, loading, autocompleteError}}
            />
          </Flex>
        </Flex>
      )}
    </PlacesAutocomplete>
  );
};

GoogleAddressSearchInput.propTypes = {
  address: PropTypes.string,
  onError: PropTypes.func,
  onLoading: PropTypes.func,
  onAddressSelect: PropTypes.func.isRequired,
  onAddressChange: PropTypes.func.isRequired,
  onSearchClear: PropTypes.func,
  triggerSelectOnMount: PropTypes.bool,
};

GoogleAddressSearchInput.defaultProps = {
  address: "",
  onError: () => {},
  onLoading: () => {},
  onSearchClear: () => {},
  triggerSelectOnMount: false,
};

const styles = {
  googlePlaces: {
    wrapper: {
      width: "100%",
    },
    textWrapper: {
      sx: {
        position: "relative",
        zIndex: 9,
      },
      width: "100%",
    },
    searchArrowBtn: {
      height: "46px",
      width: "46px",
      flexShrink: "0",
      ml: "8px",
      sx: {
        borderRadius: "100vh",
      },
    },
  },
  googlePlacesTextField: {
    materialWrapper: {
      width: "100%",
    },
    input: {
      fontSize: "1rem",
    },
    suffix: {
      width: "16px",
      sx: {
        cursor: "pointer",
      },
    },
  },
  autocomplete: {
    wrapper: {
      width: "100%",
      flexDirection: "column",
      sx: {
        cursor: "pointer",
        border: "1px solid",
        borderTop: "none",
        borderColor: "SEPERATOR_GREY",
        borderRadius: "4px",
        position: "absolute",
        top: "46px",
        bg: "WHITE",
      },
    },
    wrapperNoItems: {
      sx: {
        border: "none",
        position: "absolute",
        top: "46px",
        bg: "WHITE",
      },
    },
    item: {
      p: "12px",
      fontSize: "16px",
      fontFamily: "secondary",
      sx: {
        cursor: "pointer",
      },
    },
    loading: {
      p: "12px",
      fontSize: "16px",
      textAlign: "center",
    },
  },
};

export default GoogleAddressSearchInput;
