import React, {useEffect, useState} from "react";
import {Box, Button, Flex} from "rebass/styled-components";
import PropTypes from "prop-types";

import {DockModal} from "../../../common";

import PreferencesAndNotesForm from "./Form";

const PreferencesAndNotesDockForm = props => {
  const {
    isOpen,
    toggle,
    dockProps,
    header,
    readonly,
    businessId,
    customer,
    fromManageOrder,
    handleSave,
    orderNotes,
  } = props;

  const [updatedOrderNotes, setUpdatedOrderNotes] = useState(orderNotes);

  useEffect(() => {
    if (orderNotes !== updatedOrderNotes) {
      setUpdatedOrderNotes(orderNotes);
    }
  }, [isOpen]);

  const handleOrderNotesChange = event => {
    setUpdatedOrderNotes(event.target.value);
  };

  const onSave = () => {
    handleSave({
      orderNotes: updatedOrderNotes,
    });
  };

  return (
    <DockModal {...dockProps} header={header} isOpen={isOpen} toggle={toggle}>
      <Flex {...styles.wrapper}>
        <Box mx="20px">
          <PreferencesAndNotesForm
            businessId={businessId}
            readonly={readonly}
            customer={customer}
            fromManageOrder={fromManageOrder}
            handleSave={handleSave}
            orderNotes={updatedOrderNotes}
            onOrderNotesChange={handleOrderNotesChange}
          />
        </Box>
        {readonly ? null : (
          <Flex {...styles.saveButtonContainer}>
            <Button {...styles.saveButton} onClick={onSave}>
              Save
            </Button>
          </Flex>
        )}
      </Flex>
    </DockModal>
  );
};

const styles = {
  wrapper: {
    height: "calc(100% - 67px)",
    flexDirection: "column",
    justifyContent: "space-between",
    py: "18px",
  },
  saveButtonContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      py: "18px",
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

PreferencesAndNotesDockForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  dockProps: PropTypes.object,
  formProps: PropTypes.object,
  header: PropTypes.string,
  readonly: PropTypes.bool,
};

PreferencesAndNotesDockForm.defaultProps = {
  dockProps: {},
  formProps: {},
  header: "Preferences & Order Notes",
  readonly: false,
};

export default PreferencesAndNotesDockForm;
