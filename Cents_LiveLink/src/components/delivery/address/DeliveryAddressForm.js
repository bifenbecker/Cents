import React, {useState} from "react";
import {Flex, Text, Image, Button} from "rebass/styled-components";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {makeStyles} from "@material-ui/core/styles";

// APIs
import {addCustomerAddress, updateCustomerAddress} from "../../../api/customer";

// Assets
import {ExitIcon} from "../../../assets/images";

// Utils
import {listOfStates} from "../../../utils/states";

// Material UI one-time style customization
const useStyles = makeStyles(() => ({
  selectQuantityRoot: {
    width: "100%",
  },
  formControl: {
    width: "100%",
    margin: "5px",
  },
}));

const DeliveryAddressForm = (props) => {
  const [addressDetails, setAddressDetails] = useState(
    props.addressToEdit ? props.addressToEdit : {}
  );
  const [addressError, setAddressError] = useState();
  const materialClasses = useStyles();

  const handleAddressLineOneChange = async (event) => {
    setAddressError(null);

    setAddressDetails({
      ...addressDetails,
      address1: event.target.value,
    });
  };

  const handleAddressLineTwoChange = async (event) => {
    setAddressError(null);

    setAddressDetails({
      ...addressDetails,
      address2: event.target.value,
    });
  };

  const handleCityChange = async (event) => {
    setAddressError(null);

    setAddressDetails({
      ...addressDetails,
      city: event.target.value,
    });
  };

  const handleFirstLevelSubdivisionCodeChange = async (event) => {
    setAddressError(null);

    setAddressDetails({
      ...addressDetails,
      firstLevelSubdivisionCode: event.target.value,
    });
  };

  const handlePostalCodeChange = async (event) => {
    setAddressError(null);

    setAddressDetails({
      ...addressDetails,
      postalCode: event.target.value,
    });
  };

  const saveAddress = async () => {
    try {
      if (!listOfStates.includes(addressDetails.firstLevelSubdivisionCode)) {
        return setAddressError("You must enter a valid state abbreviation");
      }

      const addressData = {
        address: addressDetails,
        centsCustomerId: props.customer.centsCustomerId,
      };
      const response = await addCustomerAddress(addressData);
      props.onSave(response.data.addressDetails.customerAddress);
    } catch (error) {
      setAddressError(error.response.data.error);
    }
  };

  const updateAddress = async () => {
    try {
      if (!listOfStates.includes(addressDetails.firstLevelSubdivisionCode)) {
        return setAddressError("You must enter a valid state abbreviation");
      }

      const addressData = {
        customerAddressId: props.addressToEdit.id,
        address: addressDetails,
        centsCustomerId: props.customer.centsCustomerId,
      };
      const response = await updateCustomerAddress(addressData);
      props.onSave(response.data.addressDetails.address);
    } catch (error) {
      setAddressError(error.response.data.error);
    }
  };

  const renderHeader = () => {
    return (
      <Flex {...styles.headerRowContainer}>
        <Flex {...styles.headerColumnContainer}>
          <Image {...styles.svgImage} onClick={props.goBack} src={ExitIcon} />
          <Text {...styles.headerRowText}>{props.headerTitle}</Text>
        </Flex>
      </Flex>
    );
  };

  const renderAddressForm = () => {
    return (
      <Flex {...styles.addressFormContainer}>
        <Flex {...styles.addressInputContainer}>
          <TextField
            color="primary"
            label="Street Address"
            value={addressDetails.address1}
            type="text"
            variant="outlined"
            onChange={handleAddressLineOneChange}
            required={true}
          />
        </Flex>
        <Flex {...styles.addressInputContainer}>
          <TextField
            color="primary"
            label="Address 2"
            value={addressDetails.address2}
            type="text"
            variant="outlined"
            placeholder="Apt, suite, unit, etc. (optional)"
            onChange={handleAddressLineTwoChange}
          />
        </Flex>
        <Flex {...styles.addressInputContainer}>
          <TextField
            color="primary"
            label="City"
            value={addressDetails.city}
            type="text"
            variant="outlined"
            placeholder="City"
            required={true}
            onChange={handleCityChange}
          />
        </Flex>
        <Flex {...styles.addressInputContainer}>
          <FormControl variant="outlined" className={materialClasses.formControl}>
            <InputLabel id="state-selection-label">State</InputLabel>
            <Select
              labelId="state-selection-label"
              id="select-label-outlined"
              value={addressDetails.firstLevelSubdivisionCode}
              onChange={handleFirstLevelSubdivisionCodeChange}
              label="State"
              className={materialClasses.selectQuantityRoot}
            >
              {listOfStates.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            color="primary"
            label="Zip"
            value={addressDetails.postalCode}
            type="text"
            variant="outlined"
            placeholder="Zip"
            required={true}
            onChange={handlePostalCodeChange}
          />
        </Flex>
        {addressError && (
          <Flex {...styles.addressInputContainer}>
            <Text {...styles.errorText}>{addressError}</Text>
          </Flex>
        )}
      </Flex>
    );
  };

  const renderFooter = () => {
    return (
      <Flex {...styles.saveButtonContainer}>
        <Button
          {...styles.saveButton}
          onClick={props.editAddress ? updateAddress : saveAddress}
        >
          {props.formButtonText}
        </Button>
      </Flex>
    );
  };

  return (
    <Flex {...styles.screenContainer}>
      <Flex {...styles.bodyContainer}>
        {renderHeader()}
        {renderAddressForm()}
      </Flex>
      {renderFooter()}
    </Flex>
  );
};

const styles = {
  screenContainer: {
    sx: {
      fontFamily: "inherit",
      height: window.innerHeight,
      justifyContent: "space-between",
      alignItems: "space-between",
      width: "100%",
      flexDirection: "column",
    },
  },
  bodyContainer: {
    sx: {
      fontFamily: "inherit",
      justifyContent: "space-between",
      flexDirection: "column",
    },
  },
  headerRowContainer: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      height: window.innerHeight * 0.1,
    },
  },
  headerRowText: {
    sx: {
      fontSize: 18,
      fontWeight: 600,
    },
  },
  svgImage: {
    sx: {
      position: "absolute",
      left: 20,
    },
  },
  headerColumnContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
    },
  },
  addressFormContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      width: "100%",
    },
    p: 15,
  },
  addressInputContainer: {
    sx: {
      flexDirection: "row",
      alignItems: "space-between",
      justifyContent: "center",
      width: "100%",
    },
  },
  saveButtonContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
    },
    py: 40,
  },
  saveButton: {
    sx: {
      backgroundColor: "#3D98FF",
      width: "80%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    py: 20,
  },
  errorText: {
    sx: {
      color: "ERROR_TEXT",
    },
  },
};

export default DeliveryAddressForm;
