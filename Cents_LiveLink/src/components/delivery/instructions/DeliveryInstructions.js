import React, {useState} from "react";
import {Flex, Text, Image, Button} from "rebass/styled-components";
import TextField from "@material-ui/core/TextField";

// Assets
import {IconBack, DisabledCheckbox, SelectedCheckbox} from "../../../assets/images";

const DeliveryInstructions = (props) => {
  const [selectCheckbox, setSelectCheckbox] = useState(
    props.address?.leaveAtDoor ? props.address?.leaveAtDoor : false
  );
  const [instructions, setInstructions] = useState(
    props.address?.instructions ? props.address?.instructions : ""
  );

  const handleInstructionsChange = (event) => {
    setInstructions(event.target.value);
  };

  const toggleCheckbox = () => {
    setSelectCheckbox(!selectCheckbox);
  };

  const saveInstructions = () => {
    if (!instructions && !selectCheckbox) {
      return props.onSkip();
    }

    const instructionsPayload = {
      instructions,
      leaveAtDoor: selectCheckbox,
    };

    props.onSave(instructionsPayload);
  };

  const renderHeader = () => {
    return (
      <Flex {...styles.headerRowContainer}>
        <Flex {...styles.headerColumnContainer}>
          <Image {...styles.svgImage} onClick={props.goBack} src={IconBack} />
          <Text {...styles.headerRowText}>Delivery instructions</Text>
        </Flex>
      </Flex>
    );
  };

  const renderSelectedAddress = () => {
    return (
      <Flex {...styles.addressContainer}>
        <Text {...styles.addressText}>
          {props.address.address1}, {props.address.city},{" "}
          {props.address.firstLevelSubdivisionCode}
        </Text>
      </Flex>
    );
  };

  const renderInstructionsForm = () => {
    return (
      <Flex {...styles.instructionsFormContainer}>
        <TextField
          type="text"
          multiline={true}
          rows={3}
          rowsMax={5}
          variant="outlined"
          label={"Delivery Instructions"}
          fullWidth={true}
          placeholder={
            "e.g. call upon arrival, entrance on right side of building, don't ring bell, etc."
          }
          color="primary"
          value={instructions}
          onChange={handleInstructionsChange}
        />
        <Flex {...styles.checkboxRow}>
          <Image
            src={selectCheckbox ? SelectedCheckbox : DisabledCheckbox}
            {...styles.checkboxImage}
            onClick={toggleCheckbox}
          />
          <Text {...styles.checkboxText}>Leave it at my door if I'm not home</Text>
        </Flex>
      </Flex>
    );
  };

  const renderFooter = () => {
    return (
      <Flex {...styles.saveButtonContainer}>
        <Button
          {...styles.saveButton}
          sx={{
            ...styles.saveButton,
            backgroundColor: "#3790F4",
            width: "80%",
            borderRadius: 31,
          }}
          onClick={saveInstructions}
        >
          SAVE
        </Button>
      </Flex>
    );
  };

  return (
    <Flex {...styles.screenContainer}>
      <Flex {...styles.bodyContainer}>
        {renderHeader()}
        {renderSelectedAddress()}
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
  instructionsFormContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    py: 10,
    px: 20,
  },
  checkboxRow: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  checkboxImage: {
    py: 20,
    pr: 15,
  },
  checkboxText: {
    sx: {
      fontWeight: 600,
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
    py: 20,
  },
  addressContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
    },
    py: "10px",
  },
  addressText: {
    sx: {
      fontSize: "14px",
    },
  },
};

export default DeliveryInstructions;
