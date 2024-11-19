import React, {useEffect} from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";

import {toast} from "react-toastify";
import {Downgraded, useHookstate} from "@hookstate/core";

import {IllustrationHomeDelivery} from "../../../../../assets/images";
import useToggle from "../../../../../hooks/useToggle";
import {onlineOrderState} from "../../../../../state/online-order";
import OrderScreenWrapper from "../common/order-screen-wrapper";
import ConfirmAddress from "../common/confirm-address";
import {NotesAndPreferencesForm, SeePricing} from "../../../../common/order-sections";
import ServiceSelection from "../common/service-selection";
import ToastError from "../../../../common/ToastError";
import {createAddressPayload} from "../../../utils";
import useSaveAddress from "../../../../../hooks/useSaveAddress";
import NumberCounter from "../../../../common/NumberCounter";

import {businessSettingsSelectors} from "../../../../../features/business/redux";
import {useAppSelector} from "app/hooks";

const OrderDetails = (props) => {
  const {
    onNextClick,
    services,
    customerAddresses,
    onAddressSave,
    loading,
    generalDeliverySettings,
    businessId,
  } = props;

  const {isOpen: showPricing, toggle: toggleShowPricing} = useToggle();
  const businessSettings = useAppSelector(
    businessSettingsSelectors.getBusinessSettingsFromRedux
  );
  const {
    addressObj,
    loading: hookLoading,
    setAddressObj,
    handleAddressChange,
    saveAddress,
  } = useSaveAddress({
    afterSuccess: (address) => {
      onAddressSave(address);
      onlineOrderState.merge({
        customerAddressInfo: address,
        customerAddressId: address.id,
      });
      onNextClick();
    },
    onFail: (error) => {
      toast.error(<ToastError message={error} />);
    },
  });

  const customerNotesState = useHookstate(onlineOrderState.customerNotes);
  const orderNotesState = useHookstate(onlineOrderState.orderNotes);
  const customerAddressState = useHookstate(onlineOrderState.customerAddressInfo);
  const businessIdState = useHookstate(onlineOrderState.businessId);
  const bagCountState = useHookstate(onlineOrderState.bagCount);
  const deliveryProvider = useHookstate(
    onlineOrderState?.orderDelivery?.pickup?.deliveryProvider
  );
  const {
    customerAddressInfo: {postalCode},
  } = useHookstate(onlineOrderState).value;

  const customerAddress = customerAddressState.attach(Downgraded).value;
  const dryCleaningSelectionState = useHookstate(onlineOrderState.hasDryCleaning);
  const laundrySelectionState = useHookstate(onlineOrderState.hasLaundry);
  const dryCleaningOfferState = useHookstate(onlineOrderState.offersDryCleaning);
  const laundryOfferState = useHookstate(onlineOrderState.offersLaundry);

  useEffect(() => {
    const address =
      customerAddresses?.find(
        (address) => address.googlePlacesId === customerAddress.googlePlacesId
      ) || customerAddress;

    setAddressObj({...address});
  }, [customerAddresses, setAddressObj, customerAddress]);

  /**
   * Set the bagCount state so it is not undefined
   */
  useEffect(() => {
    if (!bagCountState.get()) {
      bagCountState.set(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCustomerAddress = async () => {
    const payload = createAddressPayload(addressObj);

    saveAddress(payload, addressObj.googlePlacesId);
  };

  const handleCustomerNotesChange = (value) => {
    customerNotesState.set(value);
  };

  const handleOrderNotesChange = (event) => {
    orderNotesState.set(event.target.value);
  };

  /**
   * Set the bagCount state for incoming value
   *
   * @param {Number} value
   */
  const updateBagCount = (value) => {
    bagCountState.set(value);
  };

  /**
   * Toggle the dry cleaning selection
   */
  const handleDryCleaningSelection = () => {
    dryCleaningSelectionState.set(!dryCleaningSelectionState.get());
  };

  /**
   * Toggle the laundry service selection
   */
  const handleLaundryServiceSelection = () => {
    laundrySelectionState.set(!laundrySelectionState.get());
  };

  const disableNextButton = () => {
    if (!businessSettings?.dryCleaningEnabled) {
      return !onlineOrderState.servicePriceId.get();
    } else {
      return (
        (laundrySelectionState.get() && !onlineOrderState.servicePriceId.get()) ||
        (!laundrySelectionState.get() && !dryCleaningSelectionState.get())
      );
    }
  };

  return (
    <OrderScreenWrapper
      header="New Order"
      onSubmit={saveCustomerAddress}
      loading={loading || hookLoading}
      disableBtn={disableNextButton()}
      businessId={businessId}
    >
      <SeePricing
        showPricing={showPricing}
        toggleShowPricing={toggleShowPricing}
        storeId={onlineOrderState.storeId.get()}
        postalCode={postalCode}
      />
      <Flex style={{alignItems: "center", justifyContent: "center"}}>
        <Image width={"85%"} src={IllustrationHomeDelivery} pt={2} />
      </Flex>
      <Box {...styles.howItWorks.wrapper}>
        <Text>{generalDeliverySettings?.customLiveLinkHeader}</Text>
        <br />
        <Text
          {...styles.howItWorks.description}
          style={{
            overflowWrap: "break-word",
            maxWidth: "100%",
          }}
        >
          {generalDeliverySettings?.customLiveLinkMessage}
        </Text>
      </Box>

      <ServiceSelection
        services={services}
        hasDryCleaning={dryCleaningSelectionState.get()}
        offersDryCleaning={dryCleaningOfferState.get()}
        hasLaundry={laundrySelectionState.get()}
        offersLaundry={laundryOfferState.get()}
        toggleLaundry={handleLaundryServiceSelection}
        toggleDryCleaning={handleDryCleaningSelection}
        postalCode={postalCode}
      />

      <Box {...styles.blankets.wrapper}>
        <Text {...styles.blankets.subtext}>
          Blankets and larger garments will be priced per item.
          {
            <Text
              pl={"6px"}
              fontWeight={500}
              display="inline"
              variant="link"
              onClick={toggleShowPricing}
            >
              See pricing
            </Text>
          }
        </Text>
      </Box>

      <Box {...styles.boxWithTopBorder}>
        <Text pb={"12px"}>How many bags of laundry do you have?</Text>
        <NumberCounter
          count={bagCountState.get()}
          onCountChange={updateBagCount}
          max={deliveryProvider.get() !== "OWN_DRIVER" ? 5 : 20}
        />
        {bagCountState.get() === 5 && deliveryProvider.get() === "DOORDASH" && (
          <Text {...styles.disclaimerText}>
            For on demand, drivers can only take up to 5 bags of laundry.
          </Text>
        )}
      </Box>

      <Box {...styles.boxWithTopBorder}>
        <NotesAndPreferencesForm
          customerNotes={customerNotesState.get()}
          orderNotes={orderNotesState.get()}
          onOrderNotesChange={handleOrderNotesChange}
          onCustomerNotesChange={handleCustomerNotesChange}
          businessId={businessIdState.get()}
        />
      </Box>

      <Box {...styles.boxWithTopBorder} pb="0">
        <Text mb="24px" fontSize="18px">
          Confirm your pickup address
        </Text>
        <ConfirmAddress
          localAddressObj={addressObj}
          handleAddressChange={handleAddressChange}
          showInstructionsHeading
        />
      </Box>
    </OrderScreenWrapper>
  );
};

const styles = {
  howItWorks: {
    wrapper: {
      fontSize: "18px",
      m: "18px",
    },
    description: {
      fontSize: "16px",
      fontFamily: "secondary",
    },
  },
  blankets: {
    wrapper: {
      p: "32px 0",
      mx: "18px",
    },
    subtext: {
      fontFamily: "secondary",
      fontSize: "16px",
      pb: "10px",
    },
  },
  boxWithTopBorder: {
    p: "32px 0",
    mx: "18px",
    sx: {
      borderTop: "1px solid",
      borderColor: "SEPERATOR_GREY",
    },
  },
  disclaimerText: {
    fontSize: "12px",
    color: "TEXT_GREY",
    fontFamily: "secondary",
    mt: "12px",
    fontStyle: "italic",
  },
};

export default OrderDetails;
