import React from "react";
import {Box, Button, Text} from "rebass/styled-components";

import TextArea from "../../TextArea";
import useToggle from "../../../../hooks/useToggle";
import PreferenceDockForm from "./preferences/DockModalForm";

const NotesAndPreferencesForm = props => {
  const {
    readonly,
    businessId,
    customer,
    fromManageOrder,
    handleSave,
    orderNotes,
    onOrderNotesChange,
  } = props;
  const {isOpen: showPreferences, toggle: togglePreferences} = useToggle();

  return (
    <>
      <Box>
        <Button width={1} fontSize="18px" variant="outline" onClick={togglePreferences}>
          My Care Preferences
        </Button>
      </Box>
      <Box mt="32px">
        <Text fontSize="18px">Any specific notes about this order?</Text>
        <TextArea
          label="Order Notes"
          placeholder="e.g. The grey sweater has a stain on it, please use stain remover."
          materialWrapperStyle={styles.textarea.materialWrapper}
          themeStyles={styles.textarea.field}
          rows={3}
          rowsMax={5}
          value={orderNotes}
          onChange={onOrderNotesChange}
          disabled={readonly}
          maxLength={255}
        />
      </Box>
      <PreferenceDockForm
        toggle={togglePreferences}
        isOpen={showPreferences}
        header={"My Care Preferences"}
        businessId={businessId}
        customer={customer}
        fromManageOrder={fromManageOrder}
        saveSelections={handleSave}
      />
    </>
  );
};

const styles = {
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
};

export default NotesAndPreferencesForm;
