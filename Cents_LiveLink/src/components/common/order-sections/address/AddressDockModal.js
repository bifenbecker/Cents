import React, {useState} from "react";
import PropTypes from "prop-types";
import {Flex} from "rebass/styled-components";
import {toast} from "react-toastify";

import {DockModal} from "../../../common/.";

import useToggle from "../../../../hooks/useToggle";

import ListAddresses from "./ListAddresses";
import AddressForm from "./AddressForm";

const AddressDockModal = props => {
  const {
    isOpen,
    toggle,
    selectedAddress,
    dockProps,
    customerAddresses,
    onAddressChange,
    header = "Pickup / Delivery Address",
    onAddressSave,
  } = props;
  const [editAddress, setEditAddress] = useState();
  const [loader, setLoader] = useState(false);

  const {
    isOpen: showAddressForm,
    toggle: toggleAddressForm,
    setIsOpen: setShowAddressForm,
  } = useToggle();

  const onEditAddressClick = address => {
    setEditAddress(address);
  };

  const handleAddressSave = address => {
    toast.success("Address saved successfully");
    onAddressSave(address);
    closeAddressForm();
  };

  const handleBackClick = () => {
    if (showAddressForm || editAddress) {
      closeAddressForm();
    } else {
      toggle();
    }
  };

  const closeModal = () => {
    closeAddressForm();
    toggle();
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditAddress();
  };

  const onAddressAvailablity = address => {
    setEditAddress(address);
  };

  return (
    <DockModal
      {...dockProps}
      header={editAddress ? "Edit Address" : showAddressForm ? "Add New Address" : header}
      isOpen={isOpen}
      toggle={closeModal}
      loading={loader}
      onBackClick={handleBackClick}
    >
      <Flex {...styles.wrapper}>
        {showAddressForm || editAddress ? (
          <AddressForm
            editAddress={editAddress}
            setLoader={setLoader}
            handleAddressSave={handleAddressSave}
            customerAddresses={customerAddresses}
            onAddressAvailablity={onAddressAvailablity}
          />
        ) : (
          <Flex {...styles.wrapper.content}>
            <ListAddresses
              customerAddresses={customerAddresses}
              onAddressChange={onAddressChange}
              selectedAddress={selectedAddress}
              onNewAddressClick={toggleAddressForm}
              onEditAddressClick={onEditAddressClick}
            />
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

    sx: {
      position: "relative",
      overflow: "auto",
    },
    content: {
      flexDirection: "column",
      marginLeft: "18px",
      marginRight: "18px",
    },
  },
};

AddressDockModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  selectedAddress: PropTypes.object.isRequired,
  dockProps: PropTypes.object,
  customerAddresses: PropTypes.array.isRequired,
  header: PropTypes.string,
  onAddressSave: PropTypes.func.isRequired,
};

AddressDockModal.defaultProps = {
  dockProps: {},
  header: "Pickup / Delivery Address",
};

export default AddressDockModal;
