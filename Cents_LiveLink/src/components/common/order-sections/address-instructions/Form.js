import React from "react";
import PropTypes from "prop-types";
import {Flex, Image, Text} from "rebass/styled-components";

import {
  DisabledCheckbox,
  SelectedCheckbox,
  IconEmptyGrey,
  IconSelectedGrey,
} from "../../../../assets/images";

import TextArea from "../../TextArea";

const AddressInstructionsForm = props => {
  const {
    instructions,
    leaveAtDoor,
    handleChange,
    hideLeaveAtDoor,
    hideNote,
    disabled,
  } = props;

  const onHandleClick = () => {
    if (disabled) {
      return;
    } else {
      handleChange("leaveAtDoor", !leaveAtDoor);
    }
  };

  return (
    <Flex {...styles.instructionsFormContainer}>
      <TextArea
        rows={3}
        rowsMax={5}
        label="Pickup / Delivery Instructions"
        placeholder="e.g. call upon arrival, entrance on right side of building, don't ring bell, etc."
        materialWrapperStyle={styles.textarea.materialWrapper}
        themeStyles={styles.textarea.field}
        value={instructions || ""}
        onChange={e => handleChange("instructions", e.target.value)}
        disabled={disabled}
        maxLength={255}
      />
      {hideLeaveAtDoor ? null : (
        <Flex {...styles.checkboxRow} onClick={onHandleClick}>
          <Image
            src={
              disabled
                ? leaveAtDoor
                  ? IconSelectedGrey
                  : IconEmptyGrey
                : leaveAtDoor
                ? SelectedCheckbox
                : DisabledCheckbox
            }
            {...styles.checkboxImage}
          />
          <Text {...styles.checkboxText} color={!disabled ? "BLACK" : "LIGHT_GREY_TEXT"}>
            Leave deliveries at my door if I'm not home
          </Text>
        </Flex>
      )}
      {hideNote ? null : (
        <Text {...styles.noteText}>
          We will send you updates about your pickup via text.
        </Text>
      )}
    </Flex>
  );
};

const styles = {
  instructionsFormContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      width: "100%",
    },
  },
  textarea: {
    materialWrapper: {
      width: "100%",
    },
    field: {
      sx: {
        "&::placeholder": {
          fontSize: "14px",
          fontFamily: "secondary",
          fontStyle: "italic",
        },
      },
    },
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
    fontFamily: "secondary",
    sx: {
      fontWeight: 500,
    },
  },
  noteText: {
    fontSize: "12px",
    color: "TEXT_GREY",
    fontFamily: "secondary",
    mt: "12px",
  },
};

AddressInstructionsForm.propTypes = {
  instructions: PropTypes.string,
  leaveAtDoor: PropTypes.bool,
  handleChange: PropTypes.func.isRequired,
  hideLeaveAtDoor: PropTypes.bool,
  hideNote: PropTypes.bool,
};

AddressInstructionsForm.defaultProps = {
  instructions: "",
  leaveAtDoor: false,
  hideLeaveAtDoor: false,
  hideNote: false,
};

export default AddressInstructionsForm;
