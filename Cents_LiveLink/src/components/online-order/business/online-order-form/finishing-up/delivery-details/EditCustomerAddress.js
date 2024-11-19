import React, {useState, useEffect} from "react";
import {Box, Flex, Button, Text} from "rebass/styled-components";
import {Downgraded, useHookstate} from "@hookstate/core";
import {toast} from "react-toastify";
import {useHistory} from "react-router-dom";

import {onlineOrderState} from "../../../../../../state/online-order";
import {createAddressPayload} from "../../../../utils";
import useSaveAddress from "../../../../../../hooks/useSaveAddress";

import ConfirmAddress from "../../common/confirm-address";
import {ToastError, DockModal} from "../../../../../common";

const EditCustomerAddress = ({businessId, ...props}) => {
  const {isOpen, toggle} = props;
  const history = useHistory();

  const businessIdFromState = onlineOrderState.businessId.get();

  const [isChangeAddressOpen, setIsChangeAddressOpen] = useState(false);

  const customerAddressState = useHookstate(onlineOrderState.customerAddressInfo);
  const {addressObj, loading, setAddressObj, handleAddressChange, saveAddress} =
    useSaveAddress({
      afterSuccess: (address) => {
        onlineOrderState.merge({
          customerAddressInfo: address,
          customerAddressId: address.id,
        });
        toggle();
      },
      onFail: (error) => {
        toast.error(<ToastError message={error} />);
      },
    });

  const customerAddress = customerAddressState.attach(Downgraded).value;

  useEffect(() => {
    if (isOpen) {
      setAddressObj(customerAddress);
    }
  }, [customerAddress, isOpen, setAddressObj]);

  const handleSave = () => {
    const payload = createAddressPayload(addressObj);

    saveAddress(payload, addressObj.googlePlacesId);
  };

  return (
    <DockModal
      header="Confirm Address"
      isOpen={isOpen}
      toggle={isChangeAddressOpen ? () => setIsChangeAddressOpen(false) : toggle}
      loading={loading}
    >
      {isChangeAddressOpen ? (
        <Flex {...styles.confirmation}>
          <Box {...styles.confirmation.wrapper}>
            <Text {...styles.confirmation.subtext}>
              All of your current progress will be lost. Are you sure you want to proceed?
            </Text>
          </Box>
          <Flex {...styles.buttons}>
            <Button
              variant="outline"
              mr="10px"
              {...styles.buttons.button}
              onClick={() => setIsChangeAddressOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              {...styles.buttons.button}
              onClick={() => {
                history.push(
                  businessIdFromState || businessId
                    ? `/order/business/${businessIdFromState || businessId}`
                    : "/"
                );
              }}
            >
              Confirm
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex py="18px" {...styles.wrapper}>
          <Box mx="20px">
            <ConfirmAddress
              localAddressObj={addressObj}
              handleAddressChange={handleAddressChange}
            />
            <Text
              {...styles.changeAddressText}
              onClick={() => {
                setIsChangeAddressOpen(true);
              }}
            >
              Change my address
            </Text>
          </Box>

          <Flex {...styles.saveButtonContainer}>
            <Button {...styles.saveButton} onClick={() => handleSave()}>
              Update Address
            </Button>
          </Flex>
        </Flex>
      )}
    </DockModal>
  );
};

const styles = {
  wrapper: {
    height: "calc(100% - 67px)",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  changeAddressText: {
    sx: {
      pt: "16px",
      fontSize: "14px",
      color: "#3D98FF",
      textDecoration: "underline",
      textAlign: "center",
      cursor: "pointer",
    },
  },
  saveButtonContainer: {
    sx: {
      py: "18px",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
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
  confirmation: {
    height: "calc(100% - 67px)",
    py: "18px",
    mx: "18px",
    flexDirection: " column",
    justifyContent: "space-between",
    alignItems: "center",

    wrapper: {
      m: "0 24px",
    },

    subtext: {
      mt: "4px",
      fontSize: "18px",
      fontFamily: "secondary",
    },
  },
  buttons: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    my: "18px",

    button: {
      sx: {
        textTransform: "uppercase",
      },
      height: "50px",
      width: "calc(50% - 5px)",
    },
  },
};

export default EditCustomerAddress;
