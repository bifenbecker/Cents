import React, {useState} from "react";
import {Flex, Text, Image, Button} from "rebass/styled-components";
import TextField from "@material-ui/core/TextField";

// Assets
import {IconBack} from "../../../assets/images";

const CustomerPhoneNumber = (props) => {
  const [phoneNumber, setPhoneNumber] = useState(
    props.customer.phoneNumber ? props.customer.phoneNumber : ""
  );

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const savePhoneNumber = () => {
    props.onSave(phoneNumber);
  };

  const renderHeader = () => {
    return (
      <Flex {...styles.headerRowContainer}>
        <Flex {...styles.headerColumnContainer}>
          <Image {...styles.svgImage} onClick={props.goBack} src={IconBack} />
          <Text {...styles.headerRowText}>Phone Number</Text>
        </Flex>
      </Flex>
    );
  };

  const renderInstructionsForm = () => {
    return (
      <Flex {...styles.phoneFormContainer}>
        <Flex {...styles.phoneNumberRow}>
          <Text {...styles.phoneNumberDetailsText}>
            We use your phone number to send you text notifications or call you about your
            order.
          </Text>
        </Flex>
        <TextField
          type="text"
          variant="outlined"
          label={"Mobile Number (10-digit)"}
          fullWidth={true}
          color="primary"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
      </Flex>
    );
  };

  const renderFooter = () => {
    return (
      <Flex {...styles.saveButtonContainer}>
        <Button {...styles.saveButton} onClick={savePhoneNumber}>
          SAVE
        </Button>
      </Flex>
    );
  };

  return (
    <Flex {...styles.screenContainer}>
      <Flex {...styles.bodyContainer}>
        {renderHeader()}
        {renderInstructionsForm()}
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
  phoneFormContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    py: 10,
    px: 20,
  },
  phoneNumberRow: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    pb: "10px",
  },
  checkboxImage: {
    py: 20,
    pr: 15,
  },
  phoneNumberDetailsText: {
    sx: {
      fontSize: "12px",
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
    },
    py: 20,
  },
};

export default CustomerPhoneNumber;
