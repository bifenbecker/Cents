import React, {useEffect, useMemo} from "react";
import PropTypes from "prop-types";
import {Box, Button, Flex, Text} from "rebass/styled-components";
import {toast} from "react-toastify";

import useSaveAddress from "../../../../hooks/useSaveAddress";
import {createAddressPayload, formatAddress} from "../../../../utils/address";

import AddressInstructionsForm from "./Form";
import {DockModal, ToastError} from "../../.";

const AddressInstructionsDockModalForm = props => {
  const {
    isOpen,
    toggle,
    selectedAddress,
    updateSelectedAddress,
    dockProps,
    formProps,
    header = "Pickup / Delivery Instructions",
  } = props;

  const {
    addressObj,
    loading,
    setAddressObj,
    handleAddressChange,
    saveAddress,
  } = useSaveAddress({
    afterSuccess: address => {
      updateSelectedAddress(address);
      toggle();
    },
    onFail: error => {
      toast.error(<ToastError message={error} />);
    },
  });

  const formattedAddress = useMemo(() => {
    return formatAddress({...addressObj, postalCode: ""});
  }, [addressObj]);

  useEffect(() => {
    if (isOpen) {
      setAddressObj(selectedAddress);
    }
  }, [selectedAddress, isOpen, setAddressObj]);

  const handleSave = () => {
    const payload = createAddressPayload(addressObj);

    saveAddress(payload, addressObj.googlePlacesId);
  };

  return (
    <DockModal
      {...dockProps}
      header={header}
      isOpen={isOpen}
      toggle={toggle}
      loading={loading}
    >
      <Flex {...styles.wrapper}>
        <Flex {...styles.wrapper.content}>
          <Text {...styles.address}>{formattedAddress}</Text>
          <Box mx="20px">
            <AddressInstructionsForm
              {...formProps}
              handleChange={handleAddressChange}
              instructions={addressObj?.instructions}
              leaveAtDoor={addressObj?.leaveAtDoor}
            />
          </Box>
        </Flex>
        <Flex {...styles.saveButtonContainer}>
          <Button {...styles.saveButton} onClick={handleSave}>
            Save
          </Button>
        </Flex>
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

    content: {
      flexDirection: "column",
    },
  },
  address: {
    mt: "6px",
    mb: "12px",
    textAlign: "center",
    fontSize: "14px",
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
    py: 20,
  },
};

AddressInstructionsDockModalForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  selectedAddress: PropTypes.object.isRequired,
  updateSelectedAddress: PropTypes.func.isRequired,
  dockProps: PropTypes.object,
  formProps: PropTypes.object,
  header: PropTypes.string,
};

AddressInstructionsDockModalForm.defaultProps = {
  dockProps: {},
  formProps: {},
  header: "Pickup / Delivery Instructions",
};

export default AddressInstructionsDockModalForm;
