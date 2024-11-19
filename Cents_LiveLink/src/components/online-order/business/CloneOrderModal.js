import React, {useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {Flex, Text, Box, Button, Image} from "rebass/styled-components";
import {toast} from "react-toastify";

import {CloneOrderModalImage, ExitIconBold} from "../../../assets/images";
import {createAddressPayload, getServicePriceBreakdown} from "../utils";
import {cloneOrderState} from "../constants";
import {onlineOrderState} from "../../../state/online-order";

import useWindowSize from "../../../hooks/useWindowSize";
import useSaveAddress from "../../../hooks/useSaveAddress";

import {DockModal, Loader} from "../../common";
import ToastError from "../../common/ToastError";

const CloneOrderModal = props => {
  const {
    isOpen,
    toggle,
    dockProps,
    cloneOrder,
    setCloneOrderType,
    handleScheduleCardSubmit,
    currentAddress,
    customerAddresses,
    businessId,
  } = props;

  const [width] = useWindowSize();
  const fontSize = width < 321 ? "12px" : width <= 340 ? "14px" : "16px";
  const {clone: cloneOrderData, details: cloneOrderDetails} = cloneOrder;
  const {serviceModifiers} = cloneOrderDetails;
  const [customerAddressSate, setCustomerAddressState] = useState(
    customerAddresses?.find(
      add => add?.googlePlacesId === currentAddress?.googlePlacesId
    ) || {}
  );

  useEffect(() => {
    setCustomerAddressState(
      customerAddresses?.find(
        add => add?.googlePlacesId === currentAddress?.googlePlacesId
      ) || {}
    );
  }, [currentAddress?.googlePlacesId, customerAddresses]);

  const {loading: hookLoading, saveAddress} = useSaveAddress({
    afterSuccess: address => {
      setCustomerAddressState(address);
      setOrderState(address);
    },
    onFail: error => {
      toast.error(<ToastError message={error} />);
    },
  });

  const setOrderState = address => {
    onlineOrderState.set({
      businessId,
      customerAddressInfo: address?.id,
      returnMethod: cloneOrderData?.returnMethod,
      servicePriceId: cloneOrderData?.servicePriceId,
      serviceModifierIds: cloneOrderData?.serviceModifierIds,
      customerNotes: cloneOrderData?.customerNotes,
      orderNotes: cloneOrderData?.orderNotes,
      customerAddressId: address?.id,
      bagCount: cloneOrderData?.bagCount,
    });
  };

  const handleButtonClick = async typeOfClick => {
    setCloneOrderType(typeOfClick);
    if (!customerAddressSate?.id) {
      const payload = createAddressPayload(currentAddress);
      await saveAddress(payload, currentAddress?.googlePlacesId);
    } else {
      setOrderState(customerAddressSate);
    }
    toggle();
    handleScheduleCardSubmit();
  };

  const formattedAddress = useMemo(() => {
    return currentAddress?.address1 || "";
  }, [currentAddress]);

  return (
    <DockModal
      {...dockProps}
      size={400}
      isOpen={isOpen}
      toggle={toggle}
      zIndex={2}
      provideBackOption={false}
      closeOnOutsideClick
      fixedSize
    >
      <Flex {...styles.wrapper}>
        {hookLoading ? <Loader style={{height: "400px"}} /> : null}
        <Box>
          <Box {...styles.wrapper.headerContainer}>
            <Text {...styles.wrapper.headerBlue}>{formattedAddress}</Text>
            <Image
              src={ExitIconBold}
              onClick={toggle}
              {...styles.wrapper.closeButtonStyle}
            />
          </Box>
          <Text {...styles.wrapper.header}>Order again</Text>
          <Box {...styles.wrapper.midContentWrapper}>
            <Box {...styles.wrapper.midLeftContent}>
              <Text {...styles.wrapper.subHeaderText}>
                In just a few clicks you can have the same great service as last time.
              </Text>
              <>
                <Text
                  {...styles.wrapper.subHeaderText}
                  fontFamily="primary"
                  fontSize={fontSize}
                >
                  {cloneOrderDetails?.name}
                </Text>
                <Text {...styles.wrapper.contentText} fontSize={fontSize}>
                  {getServicePriceBreakdown(cloneOrderDetails)?.priceString}
                </Text>
              </>
              {serviceModifiers?.length ? (
                serviceModifiers?.length === 1 ? (
                  <>
                    <Text
                      {...styles.wrapper.subHeaderText}
                      fontWeight={400}
                      fontSize={fontSize}
                      sx={{
                        textTransform: "capitalize",
                      }}
                    >
                      +{serviceModifiers[0]?.modifier?.name}
                    </Text>
                    <Text {...styles.wrapper.contentText} fontSize={fontSize}>
                      ${serviceModifiers[0]?.modifier?.price} / lb
                    </Text>
                  </>
                ) : (
                  <Text
                    {...styles.wrapper.subHeaderText}
                    fontWeight={400}
                    fontSize={fontSize}
                  >
                    {`+ ${serviceModifiers?.length.toString()} Add-Ons`}
                  </Text>
                )
              ) : null}
            </Box>
            <Box>
              <Image src={CloneOrderModalImage} {...styles.wrapper.midRightContent} />
            </Box>
          </Box>
        </Box>
        <Box {...styles.wrapper.buttoncontainer}>
          <Button
            {...styles.wrapper.buttonOutline}
            variant="outline"
            fontSize={fontSize}
            onClick={() => {
              handleButtonClick(cloneOrderState.EDIT);
            }}
            width={"50%"}
          >
            EDIT
          </Button>
          <Button
            {...styles.wrapper.buttonSolid}
            fontSize={fontSize}
            onClick={() => {
              handleButtonClick(cloneOrderState.REVIEW);
            }}
            width={"100%"}
          >
            REVIEW & SCHEDULE
          </Button>
        </Box>
      </Flex>
    </DockModal>
  );
};

const styles = {
  wrapper: {
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    headerContainer: {
      display: "flex",
      flexDirection: "row",
      height: "20px",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "18px",
    },
    header: {
      marginLeft: "18px",
      fontSize: "24px",
      fontFamily: "primary",
      fontWeight: 700,
    },
    headerBlue: {
      fontFamily: "primary",
      color: "CENTS_BLUE",
      sx: {
        fontSize: "18px",
      },
    },
    closeButtonStyle: {
      width: "27px",
    },
    midContentWrapper: {
      display: "flex",
      flexDirection: "row",
      margin: "0 18px 18px 18px",
      justifyContent: "space-between",
    },
    midLeftContent: {
      width: "60%",
    },
    subHeaderText: {
      marginTop: "24px",
      fontFamily: "secondary",
    },
    contentText: {
      fontWeight: "100",
      fontFamily: "secondary",
      color: "DISABLED_TEXT_GREY",
      fontStyle: "italic",
    },
    midRightContent: {
      width: "100%",
    },
    buttoncontainer: {
      padding: "18px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    buttonOutline: {
      borderColor: "CENTS_BLUE",
      backgroundColor: "white",
      padding: "16px 16px",
      marginRight: "2%",
      textAlign: "center",
      color: "CENTS_BLUE",
      fontFamily: "primary",
    },
    buttonSolid: {
      backgroundColor: "CENTS_BLUE",
      padding: "16px 24px",
      textAlign: "center",
    },
  },
};

CloneOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  dockProps: PropTypes.object,
  cloneOrder: PropTypes.object,
  handleScheduleCardSubmit: PropTypes.func,
  cloneOrderDetails: PropTypes.object,
  setCloneOrderType: PropTypes.func,
};

CloneOrderModal.defaultProps = {
  dockProps: {},
  cloneOrder: {},
  cloneOrderDetails: {},
  setCloneOrderType: () => {},
  handleScheduleCardSubmit: () => {},
};

export default CloneOrderModal;
