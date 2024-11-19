import React, {useState, useMemo, useEffect} from "react";
import {Flex, Text, Button} from "rebass/styled-components";
import {toast} from "react-toastify";

import {GoogleAddressSearchInput} from "../..";
import {TextField} from "../..";
import {ToastError} from "../../.";

import {formatAddress} from "../../../online-order/utils";

import {AddressInstructionsForm} from "../.";
import {createAddressPayload} from "../../../online-order/utils";
import useSaveAddress from "../../../../hooks/useSaveAddress";

const AddressForm = props => {
  const {
    editAddress,
    setLoader,
    handleAddressSave,
    customerAddresses,
    onAddressAvailablity,
  } = props;
  const [customerAddress, setCustomerAddress] = useState("");
  const [addressError, setAddressError] = useState();
  const [searchError, setSearchError] = useState(false);

  const {
    saveAddress,
    addressObj,
    setAddressObj,
    handleAddressChange,
    loading: addressSaving,
  } = useSaveAddress({
    afterSuccess: handleAddressSave,
    onFail: error => {
      toast.error(<ToastError message={error} />);
    },
  });

  const handleSaveAddress = async () => {
    const payload = createAddressPayload(addressObj);
    saveAddress(payload, addressObj.googlePlacesId);
  };

  const formattedAddress = useMemo(() => {
    return formatAddress({...addressObj, postalCode: ""});
  }, [addressObj]);

  const handleChange = address => {
    setCustomerAddress(address);
    setAddressError("");
  };

  const onAddressSelect = ({mappedAddress}) => {
    const findAddress = customerAddresses.find(
      address => address.googlePlacesId === mappedAddress.googlePlacesId
    );
    if (findAddress?.googlePlacesId) {
      toast.success("Address is already available. You can edit the address");
      onAddressAvailablity(findAddress);
    } else {
      return setAddressObj(state => ({...state, ...mappedAddress}));
    }
  };

  const handleSearchClear = () => {
    setAddressObj(state => ({
      ...state,
      googlePlacesId: null,
      address1: null,
      city: null,
      firstLevelSubdivisionCode: null,
      postalCode: null,
      countryCode: null,
    }));
  };

  const onError = errorMessage => {
    setSearchError(errorMessage);
    // Clear the fields only if error message is there
    errorMessage && handleSearchClear();
  };

  useEffect(() => {
    setLoader(addressSaving);
  }, [setLoader, addressSaving]);

  useEffect(() => {
    setAddressObj(editAddress ? {...editAddress} : {});
  }, [setAddressObj, editAddress]);
  return (
    <>
      <Flex {...styles.formParent}>
        <Flex {...styles.formContainer}>
          {addressObj?.id ? (
            <Text {...styles.addressText}>{formattedAddress}</Text>
          ) : (
            <>
              <Flex {...styles.addressInputContainer}>
                <GoogleAddressSearchInput
                  address={customerAddress}
                  onLoading={setLoader}
                  onError={onError}
                  onAddressSelect={onAddressSelect}
                  onAddressChange={handleChange}
                  onSearchClear={handleSearchClear}
                  label="Street Address, City, State"
                />
              </Flex>
              {searchError && (
                <Flex {...styles.addressInputContainer}>
                  <Text {...styles.errorText}>{searchError}</Text>
                </Flex>
              )}
            </>
          )}
          <Flex {...styles.address2Container}>
            <TextField
              label="Apt/Suite/Unit"
              placeholder="Apt/ Suite/ Unit, etc. (Optional)"
              materialWrapperStyle={styles.input.materialWrapper}
              themeStyles={styles.input.field}
              value={addressObj?.address2 || ""}
              onChange={e => handleAddressChange("address2", e.target.value)}
              disabled={!addressObj.googlePlacesId}
            />
          </Flex>

          <AddressInstructionsForm
            instructions={addressObj?.instructions}
            leaveAtDoor={addressObj?.leaveAtDoor}
            handleChange={handleAddressChange}
            hideNote
            disabled={!addressObj.googlePlacesId}
          />

          {addressError && (
            <Flex {...styles.addressInputContainer}>
              <Text {...styles.errorText}>{addressError}</Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex {...styles.saveButtonContainer}>
        <Button
          {...styles.saveButton}
          onClick={handleSaveAddress}
          disabled={!addressObj.googlePlacesId}
        >
          {editAddress ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
        </Button>
      </Flex>
    </>
  );
};

const styles = {
  formParent: {
    sx: {
      overflow: "auto",
      marginLeft: "6px",
      marginRight: "6px",
      height: "calc(100% - 110px)",
    },
  },
  formContainer: {
    alignItems: "center",
    width: "100%",
    flexDirection: "column",

    paddingTop: "5px",
    marginLeft: "12px",
    marginRight: "12px",
    fontSize: "14px",
  },
  addressInputContainer: {
    sx: {
      flexDirection: "row",
      alignItems: "space-between",
      justifyContent: "center",
      width: "100%",
      marginBottom: "20px",
    },
  },
  saveButtonContainer: {
    sx: {
      margin: "0",
      minWidth: "0",
      position: "absolute",
      width: "100%",
      bottom: 0,
      left: 0,
      marginTop: "auto",
      boxShadow: "0 -5px 8px -7px rgba(0,0,0,0.2)",
      bg: "WHITE",
    },
  },
  saveButton: {
    sx: {
      backgroundColor: "#3D98FF",
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
      marginLeft: "18px",
      marginRight: "18px",
    },
    my: 25,
    py: 20,
  },
  errorText: {
    sx: {
      color: "ERROR_TEXT",
    },
  },

  address2Container: {
    sx: {
      width: "100%",
      paddingBottom: "20px",
    },
  },
  input: {
    materialWrapper: {
      width: "100%",
    },
    field: {
      sx: {
        "&::placeholder": {
          fontSize: "14px",
          fontStyle: "italic",
        },
      },
    },
  },
  addressText: {
    mt: "6px",
    mb: "20px",
    textAlign: "center",
    alignItems: "center",
    width: "100%",
    fontSize: "16px",
  },
  footer: {
    mt: "16px",
  },
};

export default AddressForm;
