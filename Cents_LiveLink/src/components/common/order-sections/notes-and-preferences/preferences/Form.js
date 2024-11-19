import React, {useState} from "react";
import {Flex, Text, Box} from "rebass";
import {withLDConsumer} from "launchdarkly-react-client-sdk";
import OptionSelector from "./components/OptionSelector.js";
import TextArea from "../../../TextArea";
import {Image} from "rebass/styled-components/index.js";
import {DisabledCheckbox, SelectedCheckbox} from "../../../../../assets/images/index.js";
import {Button} from "rebass/styled-components";

const styles = {
  section: {
    sx: {
      borderBottom: "1px solid",
      borderColor: "#BBBBBB",
    },
    pb: "32px",
  },

  textarea: {
    materialWrapper: {
      width: "100%",
      mt: "16px",
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
    },
  },
  checkboxImage: {
    py: 20,
    pr: 15,
  },
  checkboxText: {
    fontFamily: "Roboto Regular",
    sx: {
      fontWeight: 700,
    },
  },
  saveButtonContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      py: "18px",
      mt: "32px",
    },
  },
  saveButton: {
    sx: {
      backgroundColor: "#3D98FF",
      width: "80%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "18px",
  },
};

const PreferencesForm = ({
  preferences,
  onChangeSelection,
  onSave,
  flags,
  regularPreferences,
}) => {
  const [customerNotes, setCustomerNotes] = useState(regularPreferences?.notes);
  const [isHangDrySelected, setIsHangDrySelected] = useState(
    regularPreferences?.isHangDrySelected
  );
  const [hangDryCustomerInstructions, setHangDryCustomerInstructions] = useState(
    regularPreferences?.hangDryInstructions
  );

  const handleClickHangDry = () => {
    setIsHangDrySelected(!isHangDrySelected);
  };

  const handleSave = () => {
    onSave({customerNotes, isHangDrySelected, hangDryCustomerInstructions});
  };

  return (
    <Flex flexDirection="column" px="20px">
      {preferences.enabled && flags?.advancedPreferences && (
        <Box {...styles.section}>
          {preferences.businessCustomerPreferences.map(pref => (
            <OptionSelector
              key={pref.id}
              onSelect={onChangeSelection}
              preference={pref}
            />
          ))}
        </Box>
      )}
      {preferences.enabled &&
        preferences.hangDry.enabled === true &&
        flags?.advancedPreferences && (
          <Flex flexDirection="column" {...{...styles.section, mt: "18px"}}>
            <Flex {...styles.checkboxRow} onClick={handleClickHangDry}>
              <Image
                src={isHangDrySelected ? SelectedCheckbox : DisabledCheckbox}
                {...styles.checkboxImage}
              />
              <Text {...styles.checkboxText}>Hang Dry</Text>
            </Flex>
            <Text sx={{fontFamily: "Roboto Regular", wordWrap: "break-word"}}>
              {preferences.hangDry.instructions}
            </Text>
            <TextArea
              label="Hang Dry Instructions"
              placeholder="e.g. Please hang the 4 collared shirts I included in the black bag."
              materialWrapperStyle={styles.textarea.materialWrapper}
              themeStyles={styles.textarea.field}
              rows={3}
              rowsMax={5}
              value={hangDryCustomerInstructions}
              onChange={e => setHangDryCustomerInstructions(e.target.value)}
              maxLength={255}
            />
          </Flex>
        )}
      <Flex flexDirection="column" {...styles.section} sx={{border: "none"}}>
        <Text
          sx={{textTransform: "capitalize"}}
          fontSize="18px"
          mt={preferences.enabled ? "32px" : "none"}
        >
          Preferences Notes
        </Text>
        <TextArea
          label="Care Preferences"
          placeholder="e.g.  Hypoallergenic, please use bleach for whites"
          materialWrapperStyle={styles.textarea.materialWrapper}
          themeStyles={styles.textarea.field}
          rows={3}
          rowsMax={5}
          value={customerNotes}
          onChange={e => setCustomerNotes(e.target.value)}
          maxLength={255}
        />
      </Flex>
      <Flex {...styles.saveButtonContainer}>
        <Button {...styles.saveButton} onClick={handleSave}>
          Save Preferences
        </Button>
      </Flex>
    </Flex>
  );
};

export default withLDConsumer()(PreferencesForm);
